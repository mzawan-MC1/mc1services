import React, { Suspense, lazy, useEffect } from 'react';
import Layout from "./Layout.jsx";

import Home from "./Home";

const About = lazy(() => import("./About"));

const Contact = lazy(() => import("./Contact"));

const Portfolio = lazy(() => import("./Portfolio"));

const PortfolioDetail = lazy(() => import("./PortfolioDetail"));

const SolutionDetail = lazy(() => import("./SolutionDetail"));

const WebDevelopment = lazy(() => import("./WebDevelopment"));

const AppDevelopment = lazy(() => import("./AppDevelopment"));

const DigitalMarketing = lazy(() => import("./DigitalMarketing"));

const Production = lazy(() => import("./Production"));

const ITServices = lazy(() => import("./ITServices"));

const AdminDashboard = lazy(() => import("./AdminDashboard"));

const AdminPortfolio = lazy(() => import("./AdminPortfolio"));

const AdminPortfolioEdit = lazy(() => import("./AdminPortfolioEdit"));

const AdminTestimonials = lazy(() => import("./AdminTestimonials"));

const AdminTestimonialEdit = lazy(() => import("./AdminTestimonialEdit"));

const AdminTeam = lazy(() => import("./AdminTeam"));

const AdminTeamEdit = lazy(() => import("./AdminTeamEdit"));

const AdminContacts = lazy(() => import("./AdminContacts"));

const DevelopmentServices = lazy(() => import("./DevelopmentServices"));

const MarketingServices = lazy(() => import("./MarketingServices"));

const AdminPricing = lazy(() => import("./AdminPricing"));

const AdminPricingEdit = lazy(() => import("./AdminPricingEdit"));

const AdminFAQs = lazy(() => import("./AdminFAQs"));

const AdminFAQEdit = lazy(() => import("./AdminFAQEdit"));

const AdminClientLogos = lazy(() => import("./AdminClientLogos"));

const AdminServices = lazy(() => import("./AdminServices"));

const AdminServiceEdit = lazy(() => import("./AdminServiceEdit"));

const Automation = lazy(() => import("./Automation"));

const Tools = lazy(() => import("./Tools"));

const SalaryLoanCalculator = lazy(() => import("./SalaryLoanCalculator"));

const TrafficFinesChecker = lazy(() => import("./TrafficFinesChecker"));

const VisaOverstayCalculator = lazy(() => import("./VisaOverstayCalculator"));

const TollEstimator = lazy(() => import("./TollEstimator"));

const CurrencyConverter = lazy(() => import("./CurrencyConverter"));

const AdminSiteSettings = lazy(() => import("./AdminSiteSettings"));

const AdminSEO = lazy(() => import("./AdminSEO"));

const AdminAnalytics = lazy(() => import("./AdminAnalytics"));

const AdminCMSHome = lazy(() => import("./AdminCMSHome"));

const AdminCMSAbout = lazy(() => import("./AdminCMSAbout"));

const AdminCMSHeaderFooter = lazy(() => import("./AdminCMSHeaderFooter"));

const AdminCMSServices = lazy(() => import("./AdminCMSServices"));

const AdminCMSContact = lazy(() => import("./AdminCMSContact"));

const AdminCMSTools = lazy(() => import("./AdminCMSTools"));

const AdminUsers = lazy(() => import("./AdminUsers"));

const AdminRoles = lazy(() => import("./AdminRoles"));

const AdminProfile = lazy(() => import("./AdminProfile"));

const AdminToolsManagement = lazy(() => import("./AdminToolsManagement"));

const AdminLogin = lazy(() => import("./AdminLogin"));

const PrivacyPolicy = lazy(() => import("./PrivacyPolicy"));

const TermsOfService = lazy(() => import("./TermsOfService"));

const AdminCMSLegal = lazy(() => import("./AdminCMSLegal"));

const AdminIndustries = lazy(() => import("./AdminIndustries"));

const AdminNavigation = lazy(() => import("./AdminNavigation"));

import ScrollToTop from "../components/ScrollToTop";
const AdminTaskListPage = lazy(() => import("./AdminTaskListPage"));

const AdminTaskDetailsPage = lazy(() => import("./AdminTaskDetailsPage"));

import AdminRoute from "../components/AdminRoute";
import AdminLayout from "../components/admin/AdminLayout";

import { BrowserRouter as Router, Link, Outlet, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    About: About,
    
    Contact: Contact,
    
    Portfolio: Portfolio,
    
    PortfolioDetail: PortfolioDetail,
    
    WebDevelopment: WebDevelopment,
    
    AppDevelopment: AppDevelopment,
    
    DigitalMarketing: DigitalMarketing,
    
    Production: Production,
    
    ITServices: ITServices,
    
    AdminDashboard: AdminDashboard,
    
    AdminPortfolio: AdminPortfolio,
    
    AdminPortfolioEdit: AdminPortfolioEdit,
    
    AdminTestimonials: AdminTestimonials,
    
    AdminTestimonialEdit: AdminTestimonialEdit,
    
    AdminTeam: AdminTeam,
    
    AdminTeamEdit: AdminTeamEdit,
    
    AdminContacts: AdminContacts,
    
    DevelopmentServices: DevelopmentServices,
    
    MarketingServices: MarketingServices,
    
    AdminPricing: AdminPricing,
    
    AdminPricingEdit: AdminPricingEdit,
    
    AdminFAQs: AdminFAQs,
    
    AdminFAQEdit: AdminFAQEdit,
    
    AdminClientLogos: AdminClientLogos,
    
    AdminServices: AdminServices,
    
    AdminServiceEdit: AdminServiceEdit,
    
    Automation: Automation,
    
    Tools: Tools,
    
    SalaryLoanCalculator: SalaryLoanCalculator,
    
    TrafficFinesChecker: TrafficFinesChecker,
    
    VisaOverstayCalculator: VisaOverstayCalculator,
    
    TollEstimator: TollEstimator,
    
    CurrencyConverter: CurrencyConverter,
    
    AdminSiteSettings: AdminSiteSettings,
    
    AdminSEO: AdminSEO,
    
    AdminAnalytics: AdminAnalytics,
    
    AdminCMSHome: AdminCMSHome,
    
    AdminCMSAbout: AdminCMSAbout,
    
    AdminCMSHeaderFooter: AdminCMSHeaderFooter,
    
    AdminCMSServices: AdminCMSServices,
    
    AdminCMSContact: AdminCMSContact,
    
    AdminCMSTools: AdminCMSTools,
    
    AdminUsers: AdminUsers,
    AdminRoles: AdminRoles,
    AdminProfile: AdminProfile,
    
    AdminToolsManagement: AdminToolsManagement,
    
    AdminLogin: AdminLogin,
    
    "privacy-policy": PrivacyPolicy,
    
    "terms-of-service": TermsOfService,
    
    AdminCMSLegal: AdminCMSLegal,
    AdminIndustries: AdminIndustries,
    AdminNavigation: AdminNavigation,
    AdminTaskListPage: AdminTaskListPage,
    AdminTaskDetailsPage: AdminTaskDetailsPage,
    
}

const ALT_ROUTE_MAP = {
    '/admin': 'AdminDashboard',
    '/admin/cms': 'AdminCMSHome',
    '/admin/media': 'AdminClientLogos',
    '/admin/portfolio': 'AdminPortfolio',
    '/admin/services': 'AdminServices',
    '/admin/services/edit': 'AdminServiceEdit',
    '/admin/industries': 'AdminIndustries',
    '/admin/navigation': 'AdminNavigation',
    '/admin/faq': 'AdminFAQs',
    '/admin/team': 'AdminTeam',
    '/admin/inquiries': 'AdminContacts',
    '/admin/testimonials': 'AdminTestimonials',
    '/admin/settings': 'AdminSiteSettings',
    '/admin/seo': 'AdminSEO',
    '/admin/users': 'AdminUsers',
    '/admin/roles': 'AdminRoles',
    '/admin/profile': 'AdminProfile',
    '/admin/tasks': 'AdminTaskListPage',
};

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    const lower = url.toLowerCase();
    if (ALT_ROUTE_MAP[lower]) {
        return ALT_ROUTE_MAP[lower];
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }
    // Handle lowercase routes by finding matching key case-insensitively
    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

function PageLoading() {
    return (
        <div className="min-h-[40vh] flex items-center justify-center" role="status" aria-live="polite">
            <div className="flex items-center gap-3 text-slate-600">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" aria-hidden="true" />
                <span>Loading page...</span>
            </div>
        </div>
    );
}

function NotFound() {
    return (
        <main className="min-h-[55vh] flex items-center justify-center px-6 py-20 text-center">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">404</p>
                <h1 className="mt-3 text-3xl font-bold text-slate-900">Page not found</h1>
                <p className="mt-3 text-slate-600">The page you requested does not exist or may have moved.</p>
                <Link to="/Home" className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                    Return to homepage
                </Link>
            </div>
        </main>
    );
}

function RouteMetaDefaults() {
    const { pathname } = useLocation();

    useEffect(() => {
        const routeName = pathname.split('/').filter(Boolean).pop() || 'home';
        const isAdminRoute = pathname.toLowerCase().startsWith('/admin') || routeName.toLowerCase().startsWith('admin');

        let robots = document.querySelector('meta[name="robots"]');
        if (!robots) {
            robots = document.createElement('meta');
            robots.name = 'robots';
            document.head.appendChild(robots);
        }
        robots.content = isAdminRoute ? 'noindex, nofollow' : 'index, follow';

        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = new URL(pathname || '/Home', window.location.origin).href;
    }, [pathname]);

    return null;
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <>
        <ScrollToTop />
        <RouteMetaDefaults />
        <Layout currentPageName={currentPage}>
            <Suspense fallback={<PageLoading />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/solutions/:slug" element={<SolutionDetail />} />

                {/* Public pages retain their existing canonical and lowercase URLs. */}
                {Object.keys(PAGES)
                    .filter(pageName => !pageName.startsWith('Admin') || pageName === 'AdminLogin')
                    .map(pageName => {
                        const Component = PAGES[pageName];
                        return (
                            <React.Fragment key={pageName}>
                                <Route path={`/${pageName}`} element={<Component />} />
                                <Route path={`/${pageName.toLowerCase()}`} element={<Component />} />
                            </React.Fragment>
                        );
                    })}

                {/* One persistent protected shell keeps the admin sidebar mounted between pages. */}
                <Route element={<AdminRoute><AdminLayout><Outlet /></AdminLayout></AdminRoute>}>
                    {Object.keys(PAGES)
                        .filter(pageName => pageName.startsWith('Admin') && pageName !== 'AdminLogin')
                        .map(pageName => {
                            const Component = PAGES[pageName];
                            return (
                                <React.Fragment key={pageName}>
                                    <Route path={`/${pageName}`} element={<Component />} />
                                    <Route path={`/${pageName.toLowerCase()}`} element={<Component />} />
                                </React.Fragment>
                            );
                        })}
                    {Object.entries(ALT_ROUTE_MAP).map(([path, pageName]) => {
                        const Component = PAGES[pageName];
                        return <Route key={path} path={path} element={<Component />} />;
                    })}
                    <Route path="/admin/tasks/:id" element={<AdminTaskDetailsPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
        </Layout>
        </>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
