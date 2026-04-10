import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
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

export const registerUser    = (data)                  => API.post("/auth/register", data);
export const loginUser       = (data)                  => API.post("/auth/login", data);
export const getMyProfile    = ()                      => API.get("/auth/me");
export const logoutUser      = ()                      => API.post("/auth/logout");
export const updateProfile   = (data)                  => API.put("/auth/profile", data);
export const changePassword  = (data)                  => API.put("/auth/change-password", data);
export const forgotPassword  = (email)                 => API.post("/auth/forgot-password", { email });
export const resetPassword   = (email, otp, newPassword) => API.post("/auth/reset-password", { email, otp, newPassword });

// ── Shops 
export const createShop  = (data)      => API.post("/shops", data);
export const getMyShop   = ()          => API.get("/shops/my");
export const updateShop  = (id, data)  => API.put(`/shops/${id}`, data);
export const getShopById = (id)        => API.get(`/shops/${id}`);
export const getAllShops  = ()          => API.get("/shops");

export const toggleShopOpen      = (id)           => API.put(`/shops/${id}/toggle-open`);
export const updateBusinessHours = (id, hours)    => API.put(`/shops/${id}/business-hours`, { businessHours: hours });
export const updateHolidays      = (id, holidays) => API.put(`/shops/${id}/holidays`, { holidays });

// ── Products
export const addProduct     = (data)      => API.post("/products", data);
export const getMyProducts  = ()          => API.get("/products/my");
export const updateProduct  = (id, data)  => API.put(`/products/${id}`, data);
export const deleteProduct  = (id)        => API.delete(`/products/${id}`);
export const getProductById = (id)        => API.get(`/products/${id}`);

// ── Search 
export const searchProducts  = (params) => API.get("/search", { params });
export const compareProducts = (params) => API.get("/search/compare", { params });
export const getAutoComplete   = (q)      => API.get("/search/autocomplete",   { params: { q } });
export const getNearbyShops  = (params) => API.get("/search/nearby-shops", { params });

// ── Favourites 
export const addFavourite    = (productId) => API.post(`/favourites/${productId}`);
export const removeFavourite = (productId) => API.delete(`/favourites/${productId}`);
export const getMyFavourites = ()          => API.get("/favourites");
export const getFavouriteIds = ()          => API.get("/favourites/ids");

// ── Reviews
export const addReview    = (shopId, data) => API.post(`/reviews/${shopId}`, data);
export const getReviews   = (shopId)       => API.get(`/reviews/${shopId}`);
export const deleteReview = (shopId)       => API.delete(`/reviews/${shopId}`);

// ── Cart
export const getCart        = ()                     => API.get("/cart");
export const addToCart      = (productId, quantity)  => API.post("/cart/add", { productId, quantity });
export const updateCartItem = (productId, quantity)  => API.put("/cart/update", { productId, quantity });
export const removeFromCart = (productId)            => API.delete(`/cart/remove/${productId}`);
export const clearCart      = ()                     => API.delete("/cart/clear");

// ── Notifications 
export const getNotifications      = (params) => API.get("/notifications", { params });
export const getUnreadCount        = ()        => API.get("/notifications/unread-count");
export const markAsRead            = (id)      => API.put(`/notifications/${id}/read`);
export const markAllRead           = ()        => API.put("/notifications/mark-all-read");
export const deleteNotification    = (id)      => API.delete(`/notifications/${id}`);
export const clearAllNotifications = ()        => API.delete("/notifications/clear-all");

// ── Admin 
export const getAdminStats      = ()       => API.get("/admin/stats");
export const getAdminUsers      = (params) => API.get("/admin/users", { params });
export const banUser            = (id)     => API.put(`/admin/users/${id}/ban`);
export const deleteAdminUser    = (id)     => API.delete(`/admin/users/${id}`);
export const getAdminShops      = (params) => API.get("/admin/shops", { params });
export const toggleShop         = (id)     => API.put(`/admin/shops/${id}/toggle`);
export const deleteAdminShop    = (id)     => API.delete(`/admin/shops/${id}`);
export const getAdminProducts   = (params) => API.get("/admin/products", { params });
export const deleteAdminProduct = (id)     => API.delete(`/admin/products/${id}`);
export const getAdminReviews    = (params) => API.get("/admin/reviews", { params });
export const deleteAdminReview  = (id)     => API.delete(`/admin/reviews/${id}`);

export const uploadSingleImage    = (formData, folder = "products") =>
  API.post(`/upload/single?folder=${folder}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const uploadMultipleImages = (formData, folder = "products") =>
  API.post(`/upload/multiple?folder=${folder}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteImage          = (public_id) => API.delete("/upload", { data: { public_id } });

// ── Bulk Import 
export const previewImport   = (formData)         =>
  API.post("/import/preview", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const confirmImport   = (formData, mode)   =>
  API.post(`/import/confirm?mode=${mode}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const downloadTemplate = ()               =>
  `${process.env.REACT_APP_API_URL}/import/template`;

// Analytics 
export const trackView       = (productId) => API.post(`/analytics/view/${productId}`).catch(() => {});
export const trackCartAdd    = (productId) => API.post(`/analytics/cart-add/${productId}`).catch(() => {});
export const trackFavourite  = (productId, delta) => API.post(`/analytics/favourite/${productId}`, { delta }).catch(() => {});
export const getProductAnalytics = (productId) => API.get(`/analytics/product/${productId}`);
export const getShopAnalytics    = ()           => API.get("/analytics/shop");
export const compareProductAnalytics = (ids)   => API.get(`/analytics/compare?ids=${ids.join(",")}`);

export default API;
