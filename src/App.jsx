import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";

import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Dashboard      from "./pages/Dashboard";
import AddProduct     from "./pages/AddProduct";
import EditProduct    from "./pages/EditProduct";
import SearchResults  from "./pages/SearchResults";
import ShopDetails    from "./pages/ShopDetails";
import CreateShop     from "./pages/CreateShop";
import EditShop       from "./pages/EditShop";
import Favourites     from "./pages/Favourites";
import Analytics      from "./pages/Analytics";
import Cart           from "./pages/Cart";
import MapView        from "./pages/MapView";
import Home           from "./pages/Home";
import Profile        from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import Notifications  from "./pages/Notifications";
import BulkImport          from "./pages/BulkImport";          
import ExportReports       from "./pages/ExportReports";        
import ShopAnalytics       from "./pages/ShopAnalytics";        
import ProductAnalyticsPage from "./pages/ProductAnalytics";    
import CompareProducts     from "./pages/CompareProducts";     
import ShopCompare          from "./pages/ShopCompare";      

import AdminLayout    from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers     from "./pages/admin/AdminUsers";
import AdminShops     from "./pages/admin/AdminShops";
import AdminProducts  from "./pages/admin/AdminProducts";
import AdminReviews   from "./pages/admin/AdminReviews";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-stone-50">
    <Navbar />
    <main>{children}</main>
  </div>
);

const SKRoute = ({ children }) => (
  <MainLayout>
    <ProtectedRoute role="shopkeeper">{children}</ProtectedRoute>
  </MainLayout>
);

function App() {
  return (
    <Router>
      <Routes>

        {/* ── Admin ── */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index            element={<AdminDashboard />} />
          <Route path="users"     element={<AdminUsers />} />
          <Route path="shops"     element={<AdminShops />} />
          <Route path="products"  element={<AdminProducts />} />
          <Route path="reviews"   element={<AdminReviews />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* ── Public ── */}
        <Route path="/"               element={<MainLayout><Home /></MainLayout>} />
        <Route path="/login"          element={<MainLayout><Login /></MainLayout>} />
        <Route path="/register"       element={<MainLayout><Register /></MainLayout>} />
        <Route path="/search"         element={<MainLayout><SearchResults /></MainLayout>} />
        <Route path="/shop/:id"       element={<MainLayout><ShopDetails /></MainLayout>} />
        <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
        <Route path="/map"            element={<MainLayout><MapView /></MainLayout>} />

        <Route path="/compare"         element={<MainLayout><ShopCompare /></MainLayout>} />

        {/* ── Authenticated ── */}
        <Route path="/profile"       element={<MainLayout><ProtectedRoute><Profile /></ProtectedRoute></MainLayout>} />
        <Route path="/notifications" element={<MainLayout><ProtectedRoute><Notifications /></ProtectedRoute></MainLayout>} />

        {/* ── Customer only ── */}
        <Route path="/favourites" element={<MainLayout><ProtectedRoute role="customer"><Favourites /></ProtectedRoute></MainLayout>} />
        <Route path="/cart"       element={<MainLayout><ProtectedRoute role="customer"><Cart /></ProtectedRoute></MainLayout>} />

        {/* ── Shopkeeper only ── */}
        <Route path="/dashboard"        element={<SKRoute><Dashboard /></SKRoute>} />
        <Route path="/analytics"        element={<SKRoute><Analytics /></SKRoute>} />
        <Route path="/create-shop"      element={<SKRoute><CreateShop /></SKRoute>} />
        <Route path="/edit-shop"        element={<SKRoute><EditShop /></SKRoute>} />
        <Route path="/add-product"      element={<SKRoute><AddProduct /></SKRoute>} />
        <Route path="/edit-product/:id" element={<SKRoute><EditProduct /></SKRoute>} />
        <Route path="/import"           element={<SKRoute><BulkImport /></SKRoute>} />
        <Route path="/export"           element={<SKRoute><ExportReports /></SKRoute>} />
        <Route path="/analytics/shop"           element={<SKRoute><ShopAnalytics /></SKRoute>} />
        <Route path="/analytics/product/:id"    element={<SKRoute><ProductAnalyticsPage /></SKRoute>} />
        <Route path="/analytics/compare"        element={<SKRoute><CompareProducts /></SKRoute>} />

      

        {/* ── 404 ── */}
        <Route path="*" element={
          <MainLayout>
            <div className="text-center py-20 text-stone-400">
              <p className="text-6xl mb-4">404</p>
              <p className="text-xl font-semibold text-stone-600">Page not found</p>
            </div>
          </MainLayout>
        } />
      </Routes>

      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: "12px", fontSize: "14px" },
      }} />
    </Router>
  );
}

export default App;
