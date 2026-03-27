import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api" || "http://localhost:1000/api",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("userInfo");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const registerUser  = (data) => API.post("/auth/register", data);
export const loginUser     = (data) => API.post("/auth/login", data);
export const getMyProfile  = ()     => API.get("/auth/me");
export const logoutUser = () => API.post("/auth/logout");
export const updateProfile    = (data) => API.put("/auth/profile", data);
export const changePassword   = (data) => API.put("/auth/change-password", data);
export const forgotPassword   = (email)             => API.post("/auth/forgot-password", { email });
export const resetPassword    = (email, otp, newPassword) => API.post("/auth/reset-password", { email, otp, newPassword });

export const createShop  = (data) => API.post("/shops", data);
export const getMyShop   = ()     => API.get("/shops/my");
export const updateShop  = (id, data) => API.put(`/shops/${id}`, data);
export const getShopById = (id)   => API.get(`/shops/${id}`);
export const getAllShops  = ()     => API.get("/shops");

export const addProduct     = (data)     => API.post("/products", data);
export const getMyProducts  = ()         => API.get("/products/my");
export const updateProduct  = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct  = (id)       => API.delete(`/products/${id}`);
export const getProductById = (id)       => API.get(`/products/${id}`);

export const searchProducts  = (params) => API.get("/search", { params });
export const compareProducts = (params) => API.get("/search/compare", { params });
export const getNearbyShops  = (params) => API.get("/search/nearby-shops", { params });

export const addFavourite    = (productId) => API.post(`/favourites/${productId}`);
export const removeFavourite = (productId) => API.delete(`/favourites/${productId}`);
export const getMyFavourites = ()          => API.get("/favourites");
export const getFavouriteIds = ()          => API.get("/favourites/ids");

export const addReview    = (shopId, data) => API.post(`/reviews/${shopId}`, data);
export const getReviews   = (shopId)       => API.get(`/reviews/${shopId}`);
export const deleteReview = (shopId)       => API.delete(`/reviews/${shopId}`);

export const getCart        = ()                    => API.get("/cart");
export const addToCart      = (productId, quantity) => API.post("/cart/add", { productId, quantity });
export const updateCartItem = (productId, quantity) => API.put("/cart/update", { productId, quantity });
export const removeFromCart = (productId)           => API.delete(`/cart/remove/${productId}`);
export const clearCart      = ()                    => API.delete("/cart/clear");


export const getNotifications      = (params) => API.get("/notifications", { params });
export const getUnreadCount        = ()        => API.get("/notifications/unread-count");
export const markAsRead            = (id)      => API.put(`/notifications/${id}/read`);
export const markAllRead           = ()        => API.put("/notifications/mark-all-read");
export const deleteNotification    = (id)      => API.delete(`/notifications/${id}`);
export const clearAllNotifications = ()        => API.delete("/notifications/clear-all");

export const getAdminStats    = ()              => API.get("/admin/stats");
export const getAdminUsers    = (params)        => API.get("/admin/users", { params });
export const banUser          = (id)            => API.put(`/admin/users/${id}/ban`);
export const deleteAdminUser  = (id)            => API.delete(`/admin/users/${id}`);
export const getAdminShops    = (params)        => API.get("/admin/shops", { params });
export const toggleShop       = (id)            => API.put(`/admin/shops/${id}/toggle`);
export const deleteAdminShop  = (id)            => API.delete(`/admin/shops/${id}`);
export const getAdminProducts = (params)        => API.get("/admin/products", { params });
export const deleteAdminProduct = (id)          => API.delete(`/admin/products/${id}`);
export const getAdminReviews  = (params)        => API.get("/admin/reviews", { params });
export const deleteAdminReview = (id)           => API.delete(`/admin/reviews/${id}`);


export default API;