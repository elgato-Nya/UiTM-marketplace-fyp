import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";

import { useAuth } from "../../features/auth/hooks/useAuth";
import { restoreSession } from "../../services/auth/sessionRestorer";
import DynamicSkeleton from "../ui/Skeleton/DynamicSkeleton";

/**
 * SessionProvider - Handles session restoration on app startup with intelligent loading
 *
 * @param {Object} props
 * @param {React.Component} props.children - The app content to render after session restoration
 */
function SessionProvider({ children }) {
  const [isSessionRestored, setIsSessionRestored] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Only try to restore session if not already authenticated
        if (!isAuthenticated) {
          console.log("SessionProvider: Attempting to restore session...");

          // Add a small delay to allow any cookies to be set from previous requests
          await new Promise((resolve) => setTimeout(resolve, 50));

          const restored = await restoreSession(dispatch);

          if (!restored) {
            console.log("SessionProvider: No valid session to restore");
          }
        } else {
          console.log(
            "SessionProvider: User already authenticated, skipping session restore"
          );
        }
      } catch (error) {
        console.log("Session restoration failed:", error);
        // Only clear auth if the error is not a 429 (rate limit - refresh in progress)
        if (error?.response?.status !== 429) {
          dispatch({ type: "auth/clearAuth" });
        }
      } finally {
        setIsSessionRestored(true);
      }
    };

    // Only run session restoration once when the component mounts
    // Use a ref to prevent double calls in StrictMode
    if (!isSessionRestored && !window._sessionInitialized) {
      window._sessionInitialized = true;
      initializeSession();
    }
  }, []); // Empty dependency array - run only once on mount

  // Show skeleton loading based on the current route while restoring session
  if (!isSessionRestored) {
    return (
      <DynamicSkeleton
        type="page"
        location={location.pathname}
        config={{
          contentType: location.pathname.includes("/auth")
            ? "form"
            : location.pathname.includes("/admin") ||
                location.pathname.includes("/merchant")
              ? "dashboard"
              : "home",
          showHeader: !location.pathname.includes("/auth"),
          showSidebar:
            location.pathname.includes("/admin") ||
            location.pathname.includes("/merchant"),
          showFooter: false,
          centered: location.pathname.includes("/auth"),
        }}
      />
    );
  }

  return children;
}

export default SessionProvider;
