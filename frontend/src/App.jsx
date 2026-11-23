import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SiteProvider } from './contexts/SiteContext';
import { AuthProvider } from './contexts/AuthContext';
import PublicLayout from './components/layout/PublicLayout';
import { PageLoader } from './components/common/Skeleton';

const HomePage = lazy(() => import('./pages/public/HomePage'));
const CollectionPage = lazy(() => import('./pages/public/CollectionPage'));
const DressDetailPage = lazy(() => import('./pages/public/DressDetailPage'));
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'));
const BookingPage = lazy(() => import('./pages/public/BookingPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const BlogPage = lazy(() => import('./pages/public/BlogPage'));
const BlogDetailPage = lazy(() => import('./pages/public/BlogDetailPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));

const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminAppointmentsPage = lazy(() => import('./pages/admin/AdminAppointmentsPage'));
const AdminDressesPage = lazy(() => import('./pages/admin/AdminDressesPage'));
const AdminServicesPage = lazy(() => import('./pages/admin/AdminServicesPage'));
const AdminPostsPage = lazy(() => import('./pages/admin/AdminPostsPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));
const AdminChatbotPage = lazy(() => import('./pages/admin/AdminChatbotPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

export default function App() {
  return (
    <HelmetProvider>
      <SiteProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/bo-suu-tap" element={<CollectionPage />} />
                  <Route path="/vay-cuoi/:slug" element={<DressDetailPage />} />
                  <Route path="/dich-vu" element={<ServicesPage />} />
                  <Route path="/dat-lich" element={<BookingPage />} />
                  <Route path="/gioi-thieu" element={<AboutPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogDetailPage />} />
                  <Route path="/lien-he" element={<ContactPage />} />
                </Route>

                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="appointments" element={<AdminAppointmentsPage />} />
                  <Route path="dresses" element={<AdminDressesPage />} />
                  <Route path="services" element={<AdminServicesPage />} />
                  <Route path="posts" element={<AdminPostsPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="chatbot" element={<AdminChatbotPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </SiteProvider>
    </HelmetProvider>
  );
}
