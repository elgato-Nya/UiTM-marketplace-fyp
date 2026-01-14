const jwt = require("jsonwebtoken");
// TODO: Improve error handling
const { AppError } = require("../utils/errors");

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
};

const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });

    if (decoded.tokenType && decoded.tokenType !== "refresh") {
      throw new jwt.JsonWebTokenError("Invalid token type");
    }

    return decoded;
  } catch (jwtError) {
    if (jwtError.name === "TokenExpiredError") {
      throw new jwt.TokenExpiredError(jwtError.message, jwtError.expiredAt);
    } else if (jwtError.name === "JsonWebTokenError") {
      throw new jwt.JsonWebTokenError(jwtError.message);
    } else {
      throw new jwt.JsonWebTokenError("Token verification failed");
    }
  }
};

const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });

    if (decoded.tokenType && decoded.tokenType !== "access") {
      throw new jwt.JsonWebTokenError("Invalid token type");
    }

    return decoded;
  } catch (jwtError) {
    if (jwtError.name === "TokenExpiredError") {
      throw new jwt.TokenExpiredError(jwtError.message, jwtError.expiredAt);
    } else if (jwtError.name === "JsonWebTokenError") {
      throw new jwt.JsonWebTokenError(jwtError.message);
    } else {
      throw new jwt.JsonWebTokenError("Token verification failed");
    }
  }
};

const getTokenPair = async (user) => {
  try {
    const accessToken = user.getAccessToken();
    const refreshToken = await user.getRefreshToken();

    if (!refreshToken || !accessToken) {
      throw new AppError("Failed to generate tokens");
    }

    // Note: refreshToken is already saved to user by getRefreshToken method
    // No need to save again here

    return {
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        profile: user.profile,
      },
    };
  } catch (error) {
    throw new AppError(`Token generation failed: ${error.message}`);
  }
};

const clearRefreshTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
  });
};

module.exports = {
  getTokenFromHeader,
  verifyRefreshToken,
  verifyAccessToken,
  getTokenPair,
  clearRefreshTokenCookie,
};
