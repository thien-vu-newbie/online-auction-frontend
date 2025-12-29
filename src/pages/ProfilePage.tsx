import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  UserIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  ShieldCheckIcon,
  StarIcon,
  TrophyIcon,
  GavelIcon,
  HeartIcon,
  StorefrontIcon,
  LockKeyIcon,
  ArrowsClockwiseIcon,
} from '@phosphor-icons/react';
import { useUserProfile, useUpdateProfile, useChangePassword, useRequestSellerUpgrade } from '@/hooks/useUsers';
import { useMyReceivedRatings } from '@/hooks/useRatings';
import { useMyParticipatingProducts, useMyRejectedProducts, useMyWonProducts } from '@/hooks/useUsers';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useMyProducts } from '@/hooks/useSeller';
import { ProductCard } from '@/components/product/ProductCard';
import { formatDate } from '@/lib/formatters';

export function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: ratingsData, isLoading: ratingsLoading } = useMyReceivedRatings(1, 10);
  const { data: participatingProducts, isLoading: participatingLoading } = useMyParticipatingProducts();
  const { data: rejectedProducts, isLoading: rejectedLoading } = useMyRejectedProducts();
  const { data: wonProducts, isLoading: wonLoading } = useMyWonProducts();
  const { data: watchlistData, isLoading: watchlistLoading } = useWatchlist(1, 20);
  
  const isSeller = profile?.role === 'seller';
  const { data: myProducts, isLoading: myProductsLoading } = useMyProducts(1, 12, 'active');
  const { data: soldProducts, isLoading: soldProductsLoading } = useMyProducts(1, 12, 'sold');

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const requestSellerUpgrade = useRequestSellerUpgrade();

  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    address: '',
    dateOfBirth: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleEditProfile = () => {
    if (profile) {
      setProfileForm({
        fullName: profile.fullName,
        email: profile.email,
        address: profile.address || '',
        dateOfBirth: profile.dateOfBirth || '',
      });
      setEditMode(true);
    }
  };

  const handleSaveProfile = async () => {
    await updateProfile.mutateAsync(profileForm);
    setEditMode(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }
    await changePassword.mutateAsync({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    });
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleRequestSellerUpgrade = async () => {
    await requestSellerUpgrade.mutateAsync();
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-8">
          <p>Không tìm thấy thông tin người dùng</p>
        </div>
      </div>
    );
  }

  const ratingPercentage = ratingsData?.summary?.ratingPercentage || 0;
  const totalRatings = (ratingsData?.summary?.ratingPositive || 0) + (ratingsData?.summary?.ratingNegative || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
              <p className="text-muted-foreground">Quản lý thông tin và hoạt động của bạn</p>
            </div>
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                <UserIcon size={32} weight="fill" />
              </AvatarFallback>
            </Avatar>
          </div>

          <Tabs defaultValue="info" className="space-y-6">
            <TabsList className={`grid w-full ${isSeller ? 'grid-cols-9' : 'grid-cols-7'}`}>
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="ratings">Đánh giá</TabsTrigger>
              <TabsTrigger value="participating">Đang tham gia</TabsTrigger>
              <TabsTrigger value="rejected">Bị từ chối</TabsTrigger>
              <TabsTrigger value="won">Đã thắng</TabsTrigger>
              <TabsTrigger value="watchlist">Yêu thích</TabsTrigger>
              {isSeller && (
                <>
                  <TabsTrigger value="my-products">Sản phẩm</TabsTrigger>
                  <TabsTrigger value="sold">Đã bán</TabsTrigger>
                </>
              )}
              <TabsTrigger value="security">Bảo mật</TabsTrigger>
            </TabsList>

            {/* Thông tin cá nhân */}
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Thông tin cá nhân</CardTitle>
                      <CardDescription>Xem và cập nhật thông tin của bạn</CardDescription>
                    </div>
                    {!editMode && (
                      <Button onClick={handleEditProfile} variant="outline">
                        Chỉnh sửa
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Họ và tên</Label>
                      {editMode ? (
                        <Input
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <UserIcon size={18} className="text-muted-foreground" />
                          <span>{profile.fullName}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      {editMode ? (
                        <Input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <EnvelopeIcon size={18} className="text-muted-foreground" />
                          <span>{profile.email}</span>
                          {profile.isEmailVerified && (
                            <ShieldCheckIcon size={18} className="text-green-600" weight="fill" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Địa chỉ</Label>
                      {editMode ? (
                        <Input
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <MapPinIcon size={18} className="text-muted-foreground" />
                          <span>{profile.address || 'Chưa cập nhật'}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Ngày sinh</Label>
                      {editMode ? (
                        <Input
                          type="date"
                          value={profileForm.dateOfBirth}
                          onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <CalendarIcon size={18} className="text-muted-foreground" />
                          <span>{profile.dateOfBirth ? formatDate(profile.dateOfBirth) : 'Chưa cập nhật'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {editMode && (
                    <div className="flex gap-3 justify-end">
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Hủy
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                        {updateProfile.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </Button>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Vai trò và xếp hạng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <UserIcon size={24} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Vai trò</p>
                              <p className="font-semibold capitalize">{profile.role}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-100 dark:bg-amber-950 rounded-lg">
                              <StarIcon size={24} className="text-amber-600 dark:text-amber-400" weight="fill" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Đánh giá</p>
                              <p className="font-semibold">{ratingPercentage.toFixed(1)}%</p>
                              <p className="text-xs text-muted-foreground">({totalRatings} lượt)</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
                              <TrophyIcon size={24} className="text-green-600 dark:text-green-400" weight="fill" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Đã thắng</p>
                              <p className="font-semibold">{wonProducts?.length || 0} sản phẩm</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {profile.role === 'bidder' && !profile.isRequestingSellerUpgrade && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Nâng cấp lên Seller</h3>
                        <p className="text-sm text-muted-foreground">
                          Bạn muốn bán sản phẩm trên sàn? Gửi yêu cầu nâng cấp lên seller (có hiệu lực trong 7 ngày sau khi được duyệt)
                        </p>
                        <Button onClick={handleRequestSellerUpgrade} disabled={requestSellerUpgrade.isPending} className="gap-2">
                          <StorefrontIcon size={18} />
                          {requestSellerUpgrade.isPending ? 'Đang gửi...' : 'Yêu cầu nâng cấp Seller'}
                        </Button>
                      </div>
                    </>
                  )}

                  {profile.isRequestingSellerUpgrade && (
                    <>
                      <Separator />
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                        <div className="flex items-center gap-2">
                          <ArrowsClockwiseIcon size={20} className="text-amber-600" />
                          <p className="font-medium text-amber-900 dark:text-amber-100">Yêu cầu đang chờ duyệt</p>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          Admin sẽ xem xét yêu cầu của bạn trong thời gian sớm nhất
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Đánh giá */}
            <TabsContent value="ratings">
              <Card>
                <CardHeader>
                  <CardTitle>Đánh giá từ người dùng khác</CardTitle>
                  <CardDescription>Xem các đánh giá bạn đã nhận được</CardDescription>
                </CardHeader>
                <CardContent>
                  {ratingsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : ratingsData && ratingsData.ratings.length > 0 ? (
                    <div className="space-y-4">
                      {ratingsData.ratings.map((rating) => (
                        <div key={rating._id} className="p-4 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant={rating.rating === 1 ? 'default' : 'destructive'}>
                                {rating.rating === 1 ? '+1' : '-1'}
                              </Badge>
                              <div>
                                <p className="font-medium">{rating.fromUserId.fullName}</p>
                                <p className="text-sm text-muted-foreground">{formatDate(rating.createdAt)}</p>
                              </div>
                            </div>
                            {rating.productId && (
                              <p className="text-sm text-muted-foreground">SP: {rating.productId.name}</p>
                            )}
                          </div>
                          <p className="text-sm">{rating.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <StarIcon size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Chưa có đánh giá nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Đang tham gia */}
            <TabsContent value="participating">
              <Card>
                <CardHeader>
                  <CardTitle>Sản phẩm đang tham gia đấu giá</CardTitle>
                  <CardDescription>Các sản phẩm bạn đã đặt giá</CardDescription>
                </CardHeader>
                <CardContent>
                  {participatingLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Skeleton className="h-64" />
                      <Skeleton className="h-64" />
                      <Skeleton className="h-64" />
                    </div>
                  ) : participatingProducts && participatingProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {participatingProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <GavelIcon size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Bạn chưa tham gia đấu giá sản phẩm nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bị từ chối */}
            <TabsContent value="rejected">
              <Card>
                <CardHeader>
                  <CardTitle>Sản phẩm bị từ chối</CardTitle>
                  <CardDescription>Các sản phẩm bạn bị seller từ chối</CardDescription>
                </CardHeader>
                <CardContent>
                  {rejectedLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Skeleton className="h-64" />
                      <Skeleton className="h-64" />
                      <Skeleton className="h-64" />
                    </div>
                  ) : rejectedProducts && rejectedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {rejectedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <GavelIcon size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Bạn chưa bị từ chối ở sản phẩm nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Đã thắng */}
            <TabsContent value="won">
              <Card>
                <CardHeader>
                  <CardTitle>Sản phẩm đã thắng</CardTitle>
                  <CardDescription>Các sản phẩm bạn đã thắng đấu giá</CardDescription>
                </CardHeader>
                <CardContent>
                  {wonLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Skeleton className="h-64" />
                      <Skeleton className="h-64" />
                      <Skeleton className="h-64" />
                    </div>
                  ) : wonProducts && wonProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {wonProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrophyIcon size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Bạn chưa thắng sản phẩm nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Danh sách yêu thích */}
            <TabsContent value="watchlist">
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách yêu thích</CardTitle>
                  <CardDescription>Các sản phẩm bạn đang theo dõi</CardDescription>
                </CardHeader>
                <CardContent>
                  {watchlistLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Skeleton className="h-64" />
                      <Skeleton className="h-64" />
                      <Skeleton className="h-64" />
                    </div>
                  ) : watchlistData && watchlistData.products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {watchlistData.products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <HeartIcon size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Bạn chưa có sản phẩm yêu thích nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sản phẩm của tôi (Seller) */}
            {isSeller && (
              <TabsContent value="my-products">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Sản phẩm của tôi</CardTitle>
                        <CardDescription>Quản lý các sản phẩm đang đăng bán</CardDescription>
                      </div>
                      <Button onClick={() => navigate('/post-product')} className="gap-2">
                        <StorefrontIcon size={18} />
                        Đăng sản phẩm mới
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {myProductsLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                      </div>
                    ) : myProducts && myProducts.products.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {myProducts.products.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <StorefrontIcon size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">Bạn chưa đăng sản phẩm nào</p>
                        <Button
                          className="mt-4"
                          onClick={() => navigate('/post-product')}
                        >
                          Đăng sản phẩm đầu tiên
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Đã bán (Seller) */}
            {isSeller && (
              <TabsContent value="sold">
                <Card>
                  <CardHeader>
                    <CardTitle>Sản phẩm đã bán</CardTitle>
                    <CardDescription>Các sản phẩm đã có người thắng đấu giá</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {soldProductsLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                      </div>
                    ) : soldProducts && soldProducts.products.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {soldProducts.products.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <TrophyIcon size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">Chưa có sản phẩm nào được bán</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Bảo mật */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Đổi mật khẩu</CardTitle>
                  <CardDescription>Cập nhật mật khẩu của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
                      <div className="relative">
                        <LockKeyIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="oldPassword"
                          type="password"
                          value={passwordForm.oldPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <div className="relative">
                        <LockKeyIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                      <div className="relative">
                        <LockKeyIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                      {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                        <p className="text-sm text-destructive">Mật khẩu không khớp</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        changePassword.isPending ||
                        !passwordForm.oldPassword ||
                        !passwordForm.newPassword ||
                        passwordForm.newPassword !== passwordForm.confirmPassword
                      }
                    >
                      {changePassword.isPending ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
