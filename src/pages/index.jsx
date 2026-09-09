import React from 'react';
import Layout from "./Layout.jsx";

import Home from "./Home";

import About from "./About";

import Contact from "./Contact";

import Portfolio from "./Portfolio";

import PortfolioDetail from "./PortfolioDetail";

import WebDevelopment from "./WebDevelopment";

import AppDevelopment from "./AppDevelopment";

import DigitalMarketing from "./DigitalMarketing";

import Production from "./Production";

import ITServices from "./ITServices";

import AdminDashboard from "./AdminDashboard";

import AdminPortfolio from "./AdminPortfolio";

import AdminPortfolioEdit from "./AdminPortfolioEdit";

import AdminTestimonials from "./AdminTestimonials";

import AdminTestimonialEdit from "./AdminTestimonialEdit";

import AdminTeam from "./AdminTeam";

import AdminTeamEdit from "./AdminTeamEdit";

import AdminContacts from "./AdminContacts";

import DevelopmentServices from "./DevelopmentServices";

import MarketingServices from "./MarketingServices";

import AdminPricing from "./AdminPricing";

import AdminPricingEdit from "./AdminPricingEdit";

import AdminFAQs from "./AdminFAQs";

import AdminFAQEdit from "./AdminFAQEdit";

import AdminClientLogos from "./AdminClientLogos";

import AdminServices from "./AdminServices";

import AdminServiceEdit from "./AdminServiceEdit";

import Automation from "./Automation";

import Tools from "./Tools";

import SalaryLoanCalculator from "./SalaryLoanCalculator";

import TrafficFinesChecker from "./TrafficFinesChecker";

import VisaOverstayCalculator from "./VisaOverstayCalculator";

import TollEstimator from "./TollEstimator";

import CurrencyConverter from "./CurrencyConverter";

import AdminSiteSettings from "./AdminSiteSettings";

import AdminSEO from "./AdminSEO";

import AdminAnalytics from "./AdminAnalytics";

import AdminCMSHome from "./AdminCMSHome";

import AdminCMSAbout from "./AdminCMSAbout";

import AdminCMSHeaderFooter from "./AdminCMSHeaderFooter";

import AdminCMSServices from "./AdminCMSServices";

import AdminCMSContact from "./AdminCMSContact";

import AdminCMSTools from "./AdminCMSTools";

import AdminUsers from "./AdminUsers";
import AdminRoles from "./AdminRoles";
import AdminProfile from "./AdminProfile";

import AdminToolsManagement from "./AdminToolsManagement";

import AdminLogin from "./AdminLogin";

import PrivacyPolicy from "./PrivacyPolicy";

import TermsOfService from "./TermsOfService";

import AdminCMSLegal from "./AdminCMSLegal";
import ScrollToTop from "../components/ScrollToTop";
import AdminTaskListPage from "./AdminTaskListPage";
import AdminTaskDetailsPage from "./AdminTaskDetailsPage";
import AdminRoute from "../components/AdminRoute";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

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
    AdminTaskListPage: AdminTaskListPage,
    AdminTaskDetailsPage: AdminTaskDetailsPage,
    
}

const ALT_ROUTE_MAP = {
    '/admin': 'AdminDashboard',
    '/admin/cms': 'AdminCMSHome',
    '/admin/media': 'AdminClientLogos',
    '/admin/portfolio': 'AdminPortfolio',
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

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <>
        <ScrollToTop />
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                {/* Generated Routes */}
                {Object.keys(PAGES).map(pageName => {
                    const Component = PAGES[pageName];
                    const element = pageName.startsWith('Admin') && pageName !== 'AdminLogin'
                        ? <AdminRoute><Component /></AdminRoute>
                        : <Component />;
                    return (
                        <React.Fragment key={pageName}>
                            {/* Standard case-sensitive route */}
                            <Route path={`/${pageName}`} element={element} />
                            {/* Lowercase fallback route for user typing */}
                            <Route path={`/${pageName.toLowerCase()}`} element={element} />
                        </React.Fragment>
                    );
                })}
                {/* Admin simple routes */}
                {Object.entries(ALT_ROUTE_MAP).map(([path, pageName]) => {
                    const Component = PAGES[pageName];
                    return <Route key={path} path={path} element={<AdminRoute><Component /></AdminRoute>} />;
                })}
                {/* New tasks routes */}
                <Route path="/admin/tasks" element={<AdminRoute><AdminTaskListPage /></AdminRoute>} />
                <Route path="/admin/tasks/:id" element={<AdminRoute><AdminTaskDetailsPage /></AdminRoute>} />
            </Routes>
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
