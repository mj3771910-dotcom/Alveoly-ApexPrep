import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ✅ NEW
import ProtectedRoute from "./components/ProtectedRoute";
import AuthSuccess from "./pages/AuthSuccess";

// PUBLIC PAGES
import Home from "./pages/Home";
import FeaturesPage from "./pages/FeaturesPage";
import SubjectsPage from "./pages/SubjectsPage";
import PricingPage from "./pages/PricingPage";
import TestimonialPage from "./pages/TestimonialPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import CareersPage from "./pages/CareersPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsConditionsPage from "./pages/TermsConditionsPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";

// STUDENT
import AIChat from "./pages/AIChat";

// ADMIN CORE
import AdminDashboard from "./pages/AdminDashboard";

// ADMIN FEATURES
import AIAdmin from "./pages/AIAdmin";
import AdminLayout from "./pages/AdminLayout";
import AdminSubjects from "./pages/AdminSubjects";
import AdminQuestions from "./pages/AdminQuestions";
import AdminCourses from "./pages/AdminCourses";

// STUDENT PAGES
import StudentDashboard from "./pages/StudentDashboard";
import StudentLayout from "./pages/StudentLayout";
import StudentPayments from "./pages/StudentPayments";
import StudentCourses from "./pages/StudentCourses";
import StudentSubjects from "./pages/StudentSubjects";
import StudentProgress from "./pages/StudentProgress";
import StudentExams from "./pages/StudentExams";
import StudentTrial from "./pages/StudentTrial";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminPayments from "./pages/AdminPayments";
import AdminUsers from "./pages/AdminUsers";
import AdminPlans from "./pages/AdminPlans";
import StudentPlans from "./pages/StudentPlans";
import AdminExamResults from "./pages/AdminExamResults";
import AIPlansAdmin from "./pages/AIPlansAdmin";
import AIGenerator from "./pages/AdminAIGeneratorU";
import AdminTestimonials from "./pages/AdminTestimonials";
import StudentTestimonials from "./pages/StudentTestimonials";
import AdminInbox from "./pages/AdminInbox";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  return (
      <div className="min-h-screen bg-gray-100">

        <Routes>

          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/testimonials" element={<TestimonialPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          {/* AUTH */}
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* ✅ GOOGLE SUCCESS HANDLER */}
          <Route path="/select-course" element={<AuthSuccess />} />

          {/* SUPPORT */}
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/careers" element={<CareersPage />} />

          {/* LEGAL */}
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsConditionsPage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route path="/refund" element={<RefundPolicyPage />} />

          {/* ================= STUDENT ================= */}

          {/* AI Chat (Protected too) */}
          <Route
            path="/student-ai"
            element={
              <ProtectedRoute role="student">
                <AIChat />
              </ProtectedRoute>
            }
          />

          {/* Student Layout */}
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="subjects" element={<StudentSubjects />} />
            <Route path="/student/trial/:courseId/:subjectId" element={<StudentTrial />} />
<Route path="/student/exams/:courseId/:subjectId" element={<StudentExams />} />
            <Route path="payments" element={<StudentPayments />} />
            <Route path="plans" element={<StudentPlans />} />
            <Route path="testimonials" element={<StudentTestimonials />} />
            {/* ✅ NEW AI ROUTE */}
  <Route path="ai" element={<AIChat />} />
  <Route path="progress" element={<StudentProgress />} />
          </Route>

          {/* ================= ADMIN ================= */}

          <Route
            path="/admin"
            element={
              
                <AdminLayout />
              
            }
          >
            {/* Dashboard */}
            <Route index element={<AdminDashboard />} />

            {/* AI */}
            <Route path="ai" element={<AIAdmin />} />

            {/* Core Management */}
            <Route path="subjects" element={<ProtectedRoute role="admin"><AdminSubjects /></ProtectedRoute>} />
            <Route path="questions" element={<ProtectedRoute role="admin"><AdminQuestions /></ProtectedRoute>} />
            <Route path="courses" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
            <Route path="payments" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="plans" element={<ProtectedRoute role="admin"><AdminPlans /></ProtectedRoute>} />
            <Route path="results" element={<ProtectedRoute role="admin"><AdminExamResults /></ProtectedRoute>} />
            <Route path="ai-plans" element={<ProtectedRoute role="admin"><AIPlansAdmin /></ProtectedRoute>} />
            <Route path="ai-generator" element={<ProtectedRoute role="admin"><AIGenerator /></ProtectedRoute>} />
             <Route path="testimonials" element={<ProtectedRoute role="admin"><AdminTestimonials /></ProtectedRoute>} />
             <Route path="in-box" element={<ProtectedRoute role="admin"><AdminInbox /></ProtectedRoute>} />
            {/* FUTURE */}
            {/* <Route path="users" element={<ManageUsers />} /> */}
            {/* <Route path="payments" element={<Payments />} /> */}
          </Route>

        </Routes>
      </div>
  );
}

export default App;