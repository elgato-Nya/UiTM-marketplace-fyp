const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
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
      throw new Error("Failed to generate tokens");
    }

    // Note: refreshToken is already saved to user by getRefreshToken method
    // No need to save again here

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
};

module.exports = {
  getTokenFromHeader,
  verifyRefreshToken,
  verifyAccessToken,
  getTokenPair,
  clearRefreshTokenCookie,
};
