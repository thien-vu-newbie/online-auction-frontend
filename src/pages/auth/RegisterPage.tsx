import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetRegistration, setOtpResendCooldown } from '@/store/slices/authSlice';
import { useRegister, useVerifyOtp, useResendOtp } from '@/hooks/useAuth';
import {
  UserIcon,
  EnvelopeIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon,
  SpinnerGapIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  MapPinIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    loading,
    error,
    registrationStep,
    pendingRegistration,
    otpExpiresAt,
    otpResendCooldown,
  } = useAppSelector((state) => state.auth);

  // API hooks
  const registerMutation = useRegister();
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  // reCAPTCHA v2
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimeLeft, setOtpTimeLeft] = useState(0);

  // Calculate OTP time left
  useEffect(() => {
    if (otpExpiresAt) {
      const interval = setInterval(() => {
        const timeLeft = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
        setOtpTimeLeft(timeLeft);
        if (timeLeft === 0) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpExpiresAt]);

  // Countdown for resend cooldown
  useEffect(() => {
    if (otpResendCooldown > 0) {
      const interval = setInterval(() => {
        dispatch(setOtpResendCooldown(otpResendCooldown - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpResendCooldown, dispatch]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vui lòng nhập họ';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Vui lòng nhập tên';
    }

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa chữ hoa, chữ thường và số';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Check reCAPTCHA
    if (!recaptchaToken) {
      setErrors((prev) => ({ ...prev, recaptcha: 'Vui lòng xác nhận bạn không phải robot' }));
      return;
    }

    // Combine firstName and lastName for backend
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    registerMutation.mutate({
      fullName,
      email: formData.email,
      password: formData.password,
      address: formData.address,
      recaptchaToken,
    });
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    if (token && errors.recaptcha) {
      const newErrors = { ...errors };
      delete newErrors.recaptcha;
      setErrors(newErrors);
    }
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
  };

  const handleVerifyOtp = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      return;
    }

    verifyOtpMutation.mutate({
      email: pendingRegistration?.email || formData.email,
      otp: otpString,
    });
  };

  const handleResendOtp = () => {
    if (otpResendCooldown > 0) return;

    resendOtpMutation.mutate(
      { email: pendingRegistration?.email || formData.email },
      {
        onSuccess: () => {
          setOtp(['', '', '', '', '', '']);
        },
      }
    );
  };

  const handleBackToForm = () => {
    dispatch(resetRegistration());
    setOtp(['', '', '', '', '', '']);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render registration form
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Name fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Họ</Label>
          <div className="relative">
            <UserIcon
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="firstName"
              placeholder="Nguyễn"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className={cn(
                "pl-10",
                errors.firstName &&
                  "border-destructive focus-visible:ring-destructive"
              )}
            />
          </div>
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Tên</Label>
          <Input
            id="lastName"
            placeholder="Văn A"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className={cn(
              errors.lastName &&
                "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <EnvelopeIcon
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={cn(
              "pl-10",
              errors.email &&
                "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <LockIcon
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className={cn(
              "pl-10 pr-10",
              errors.password &&
                "border-destructive focus-visible:ring-destructive"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
        </p>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <div className="relative">
          <LockIcon
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className={cn(
              "pl-10 pr-10",
              errors.confirmPassword &&
                "border-destructive focus-visible:ring-destructive"
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon size={20} />
            ) : (
              <EyeIcon size={20} />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Địa chỉ</Label>
        <div className="relative">
          <MapPinIcon
            size={20}
            className="absolute left-3 top-2 text-muted-foreground"
          />
          <Textarea
            id="address"
            placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className={cn(
              "pl-10 min-h-[80px] resize-none",
              errors.address &&
                "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address}</p>
        )}
      </div>

      {/* reCAPTCHA */}
      <div className="space-y-2">
        <div className="flex justify-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={handleRecaptchaChange}
            onExpired={handleRecaptchaExpired}
          />
        </div>
        {errors.recaptcha && (
          <p className="text-sm text-destructive text-center">{errors.recaptcha}</p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full h-11 cursor-pointer"
        disabled={loading}
      >
        {loading ? (
          <>
            <SpinnerGapIcon size={20} className="animate-spin" />
            Đang xử lý...
          </>
        ) : (
          "Đăng ký"
        )}
      </Button>

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );

  // Render OTP verification
  const renderOtpVerification = () => (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={handleBackToForm}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeftIcon size={16} />
        Quay lại
      </Button>

      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldCheckIcon size={40} weight="duotone" className="text-primary" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Xác thực email</h3>
        <p className="text-sm text-muted-foreground">
          Chúng tôi đã gửi mã xác thực đến{' '}
          <span className="font-medium text-foreground">{pendingRegistration?.email}</span>
        </p>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      {/* OTP Input */}
      <div className="flex justify-center gap-2">
        {otp.map((digit, index) => (
          <Input
            key={index}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            onPaste={index === 0 ? handleOtpPaste : undefined}
            className="w-12 h-14 text-center text-xl font-semibold"
          />
        ))}
      </div>

      {/* Time remaining */}
      <div className="text-center">
        {otpTimeLeft > 0 ? (
          <p className="text-sm text-muted-foreground">
            Mã hết hạn sau{' '}
            <span className="font-medium text-primary">{formatTime(otpTimeLeft)}</span>
          </p>
        ) : (
          <p className="text-sm text-destructive">Mã đã hết hạn</p>
        )}
      </div>

      {/* Verify button */}
      <Button
        onClick={handleVerifyOtp}
        className="w-full h-11 cursor-pointer"
        disabled={loading || otp.join('').length !== 6}
      >
        {loading ? (
          <>
            <SpinnerGapIcon size={20} className="animate-spin" />
            Đang xác thực...
          </>
        ) : (
          'Xác nhận'
        )}
      </Button>

      {/* Resend OTP */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Không nhận được mã?{' '}
          <button
            onClick={handleResendOtp}
            disabled={otpResendCooldown > 0 || loading}
            className={cn(
              "font-medium",
              "cursor-pointer",
              otpResendCooldown > 0
                ? "text-muted-foreground cursor-not-allowed"
                : "text-primary hover:underline"
            )}
          >
            {otpResendCooldown > 0
              ? `Gửi lại sau ${otpResendCooldown}s`
              : 'Gửi lại mã'}
          </button>
        </p>
      </div>
    </div>
  );

  // Render success message
  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircleIcon size={48} weight="fill" className="text-green-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-green-600">Đăng ký thành công!</h3>
        <p className="text-sm text-muted-foreground">
          Chào mừng bạn đến với AuctionHub. Tài khoản của bạn đã được tạo thành công.
        </p>
      </div>

      <Button onClick={() => navigate('/')} className="w-full h-11">
        Bắt đầu khám phá
      </Button>
    </motion.div>
  );

  return (
    <AuthLayout
      title={registrationStep === 'form' ? 'Tạo tài khoản' : ''}
      subtitle={registrationStep === 'form' ? 'Tham gia cộng đồng đấu giá ngay hôm nay' : ''}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={registrationStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {registrationStep === 'form' && renderForm()}
          {registrationStep === 'otp' && renderOtpVerification()}
          {registrationStep === 'success' && renderSuccess()}
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
}
