import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

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
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import CareersPage from "./pages/CareersPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsConditionsPage from "./pages/TermsConditionsPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";

// STUDENT PAGES
import AIChat from "./pages/AIChat";
import StudentLayout from "./pages/StudentLayout";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCourses from "./pages/StudentCourses";
import StudentSubjects from "./pages/StudentSubjects";
import StudentTrial from "./pages/StudentTrial";
import StudentExams from "./pages/StudentExams";
import StudentPayments from "./pages/StudentPayments";
import StudentPlans from "./pages/StudentPlans";
import StudentProgress from "./pages/StudentProgress";
import StudentTestimonials from "./pages/StudentTestimonials";
import SelectCoursePage from "./pages/SelectCoursePage";
import PaymentSuccess from "./pages/PaymentSuccess";

// ADMIN PAGES
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSubjects from "./pages/AdminSubjects";
import AdminQuestions from "./pages/AdminQuestions";
import AdminCourses from "./pages/AdminCourses";
import AdminPayments from "./pages/AdminPayments";
import AdminUsers from "./pages/AdminUsers";
import AdminPlans from "./pages/AdminPlans";
import AdminExamResults from "./pages/AdminExamResults";
import AIPlansAdmin from "./pages/AIPlansAdmin";
import AIAdmin from "./pages/AIAdmin";
import AIGenerator from "./pages/AdminAIGeneratorU";
import AdminTestimonials from "./pages/AdminTestimonials";
import AdminInbox from "./pages/AdminInbox";

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

        {/* SUPPORT */}
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/careers" element={<CareersPage />} />

        {/* LEGAL */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsConditionsPage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
        <Route path="/refund" element={<RefundPolicyPage />} />

        {/* SELECT COURSE (Protected) */}
        <Route
          path="/select-course"
          element={
            <ProtectedRoute role="student">
              <SelectCoursePage />
            </ProtectedRoute>
          }
        />

        {/* ================= STUDENT ================= */}
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
          <Route path="trial/:courseId/:subjectId" element={<StudentTrial />} />
          <Route path="exams/:courseId/:subjectId" element={<StudentExams />} />
          <Route path="payments" element={<StudentPayments />} />
          <Route path="plans" element={<StudentPlans />} />
          <Route path="progress" element={<StudentProgress />} />
          <Route path="testimonials" element={<StudentTestimonials />} />
          <Route path="ai" element={<AIChat />} />
        </Route>

        {/* Standalone AI chat for students */}
        <Route
          path="/student-ai"
          element={
            <ProtectedRoute role="student">
              <AIChat />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="ai" element={<AIAdmin />} />
          <Route path="subjects" element={<AdminSubjects />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="results" element={<AdminExamResults />} />
          <Route path="ai-plans" element={<AIPlansAdmin />} />
          <Route path="ai-generator" element={<AIGenerator />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="in-box" element={<AdminInbox />} />
        </Route>

      </Routes>
    </div>
  );
}

export default App;