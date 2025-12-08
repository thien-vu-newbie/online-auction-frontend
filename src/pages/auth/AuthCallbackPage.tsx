import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { tokenStorage } from '@/lib/api/client';
import { SpinnerGapIcon, CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';

interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = () => {
      const success = searchParams.get('success');
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refresh_token');
      const userParam = searchParams.get('user');
      const error = searchParams.get('error');

      if (success === 'false' || error) {
        setStatus('error');
        setErrorMessage(error || 'Đăng nhập Google thất bại');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (success === 'true' && token) {
        // Store the tokens
        tokenStorage.setTokens(token, refreshToken || '');

        // Parse user info from URL
        if (userParam) {
          try {
            const apiUser: ApiUser = JSON.parse(decodeURIComponent(userParam));
            
            // Parse fullName into firstName/lastName
            const nameParts = apiUser.fullName?.split(' ') || ['User'];
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';

            const user = {
              id: apiUser.id,
              email: apiUser.email,
              firstName,
              lastName,
              role: apiUser.role as 'admin' | 'seller' | 'bidder',
              isVerified: true,
              rating: 0,
              totalRatings: 0,
              positiveRatings: 0,
              createdAt: new Date().toISOString(),
            };

            // Save to localStorage and Redux
            tokenStorage.setUser(user);
            dispatch(setUser(user));
          } catch (err) {
            console.error('Failed to parse user info:', err);
          }
        }

        setStatus('success');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setStatus('error');
        setErrorMessage('Không tìm thấy thông tin xác thực');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <SpinnerGapIcon size={48} className="animate-spin mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Đang xử lý đăng nhập...</h2>
            <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleIcon size={48} className="mx-auto text-green-500" weight="fill" />
            <h2 className="text-xl font-semibold text-green-600">Đăng nhập thành công!</h2>
            <p className="text-muted-foreground">Đang chuyển hướng...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircleIcon size={48} className="mx-auto text-destructive" weight="fill" />
            <h2 className="text-xl font-semibold text-destructive">Đăng nhập thất bại</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
            <p className="text-sm text-muted-foreground">Đang chuyển về trang đăng nhập...</p>
          </>
        )}
      </div>
    </div>
  );
}
