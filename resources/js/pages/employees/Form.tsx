import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadButton } from '@/components/ui/upload-button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BreadcrumbItem, type Division } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n';
import { Save, ArrowLeft, XCircle, KeyRound, Mail } from 'lucide-react'; // Import icons
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { router, usePage } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Role {
  id: number;
  name: string;
}

interface Employee {
  id?: number;
  name: string;
  email: string;
  nik: string | null;
  personal_email: string | null;
  phone_number: string | null;
  address: string | null;
  manager_id: number | null;
  division_id: number | null;
  roles?: string[];
}

interface PotentialManager {
  id: number;
  name: string;
}

interface LocationOption {
  id: number;
  name: string;
  type: 'company' | 'branch' | 'site';
}

interface Props {
  employee?: Employee;
  roles: Role[];
  currentRoles?: string[];
  potentialManagers: PotentialManager[];
  divisions: Division[];
  avatar_url?: string | null; // Existing avatar URL
  locations: LocationOption[];
}

export default function EmployeeForm({ employee, roles, currentRoles, potentialManagers, divisions, avatar_url, locations }: Props) {
  const { t } = useTranslation();
  const isEdit = !!employee;
  const page = usePage();
  const isAdmin = Boolean((page.props as any)?.auth?.is_admin);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatar_url || null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: '%', x: 25, y: 25, width: 50, height: 50 });
  const [pixelCrop, setPixelCrop] = useState<PixelCrop | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const { data, setData, post, put, processing, errors } = useForm({
    name: employee?.name || '',
    email: employee?.email || '',
    nik: employee?.nik || '',
    personal_email: employee?.personal_email || '',
    phone_number: employee?.phone_number || '',
    address: employee?.address || '',
    manager_id: employee?.manager_id || null,
    division_id: employee?.division_id || null,
    location_id: (employee as any)?.location_id || null,
    password: '',
    roles: currentRoles || [],
    avatar: null as File | null, // For new avatar file
    remove_avatar: false as boolean, // Flag to tell backend to remove avatar
  });

  // Face-aware crop similar to profile page (FaceDetector API if available, else center square)
  const cropToFaceOrCenter = async (file: File): Promise<Blob> => {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = URL.createObjectURL(file);
    });

    const w = img.width, h = img.height;
    const size = Math.min(w, h);
    let sx = Math.floor((w - size) / 2);
    let sy = Math.floor((h - size) / 2);

    // @ts-ignore
    const FD = (window as any).FaceDetector ? new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 }) : null;
    if (FD) {
      try {
        const faces = await FD.detect(img);
        if (faces && faces.length > 0) {
          const box = faces[0].boundingBox as DOMRectReadOnly;
          const cx = box.x + box.width / 2;
          const cy = box.y + box.height / 2;
          const half = Math.floor(Math.max(box.width, box.height) * 0.75);
          sx = Math.max(0, Math.floor(cx - half));
          sy = Math.max(0, Math.floor(cy - half));
          const ex = Math.min(w, sx + half * 2);
          const ey = Math.min(h, sy + half * 2);
          const side = Math.min(ex - sx, ey - sy);
          sx = Math.max(0, Math.floor(cx - side / 2));
          sy = Math.max(0, Math.floor(cy - side / 2));
        }
      } catch {}
    }

    const side = Math.min(size, w - sx, h - sy);
    const canvas = document.createElement('canvas');
    canvas.width = side;
    canvas.height = side;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, sx, sy, side, side, 0, 0, side, side);
    return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.9));
  };

  const cropWithPixels = async (file: File, pc: PixelCrop): Promise<Blob> => {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = URL.createObjectURL(file);
    });
    const canvas = document.createElement('canvas');
    canvas.width = pc.width;
    canvas.height = pc.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, pc.x, pc.y, pc.width, pc.height, 0, 0, pc.width, pc.height);
    return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.92));
  };

  const handleAvatarSelected = async (file: File | null) => {
    if (file) {
      setOriginalFile(file);
      // Auto-crop first, then open cropper for manual adjustment
      try {
        const blob = await cropToFaceOrCenter(file);
        const auto = new File([blob], file.name.replace(/\.[^.]+$/, '') + '-cropped.jpg', { type: 'image/jpeg' });
        setData('avatar', auto);
        setData('remove_avatar', false);
        setAvatarPreview(URL.createObjectURL(auto));
      } catch {}
    } else {
      setData('avatar', null);
      setAvatarPreview(null);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setData('avatar', null); // Clear file input
    setData('remove_avatar', true); // Set flag for backend
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Build FormData to support avatar upload
    const form = new FormData();
    form.append('name', data.name);
    form.append('email', data.email);
    form.append('nik', data.nik ?? '');
    form.append('personal_email', data.personal_email ?? '');
    form.append('phone_number', data.phone_number ?? '');
    form.append('address', data.address ?? '');
    if (data.password) form.append('password', data.password);
    if (data.manager_id !== null && data.manager_id !== undefined) form.append('manager_id', String(data.manager_id));
    if (data.division_id !== null && data.division_id !== undefined) form.append('division_id', String(data.division_id));
    if (data.location_id !== null && data.location_id !== undefined) form.append('location_id', String(data.location_id));
    // roles[]
    (data.roles || []).forEach((r) => form.append('roles[]', r));
    // avatar
    if (data.avatar) form.append('avatar', data.avatar);
    // remove avatar flag
    form.append('remove_avatar', removeAvatar ? '1' : '0');

    if (isEdit && employee?.id) {
      form.append('_method', 'put');
      router.post(`/employees/${employee.id}`, form, { forceFormData: true, preserveScroll: true });
    } else {
      router.post('/employees', form, { forceFormData: true, preserveScroll: true });
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Employee Management'), href: '/employees' },
    { title: isEdit ? t('Edit Employee') : t('Create Employee'), href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? t('Edit Employee') : t('Create Employee')} />
      <div className="flex-1 p-4 md:p-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isEdit ? t('Edit Employee') : t('Create New Employee')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isEdit ? t('Update employee data and roles') : t('Enter employee data and set roles')}
            </p>
            {isEdit && isAdmin && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!employee?.id) return;
                    router.put(route('users.reset-password', employee.id), {}, {
                      preserveScroll: true,
                    });
                  }}
                >
                  <KeyRound className="h-4 w-4 mr-1" /> {t('Reset Password')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!employee?.id) return;
                    router.post(route('users.send-reset-link', employee.id), {}, {
                      preserveScroll: true,
                    });
                  }}
                >
                  <Mail className="h-4 w-4 mr-1" /> {t('Send Reset Link')}
                </Button>
              </div>
            )}
          </CardHeader>

          <Separator />

          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                {/* Avatar Upload */}
                <div className="space-y-3">
                  <Label className="block" htmlFor="avatar">{t('Employee Photo (Max 2MB)')}</Label>
                  <UploadButton
                    accept="image/*"
                    label={t('Upload')}
                    placeholder="No file chosen"
                    onFileSelected={handleAvatarSelected}
                  />
                  {avatarPreview && (
                    <div className="relative mt-2 w-24 h-24 rounded-full overflow-hidden group">
                      <img src={avatarPreview} alt="Preview Avatar" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleRemoveAvatar}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {errors.avatar && <p className="text-sm text-red-500 mt-2">{errors.avatar}</p>}
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="name" className="mb-2 block">{t('Name')}</Label>
                  <Input
                    id="name"
                    placeholder={t('Full name')}
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-2">{errors.name}</p>}
                </div>

                {/* Email Perusahaan */}
                <div>
                  <Label htmlFor="email" className="mb-2 block">{t('Company Email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="company@example.com"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-2">{errors.email}</p>}
                </div>

                {/* NIK */}
                <div>
                  <Label htmlFor="nik" className="mb-2 block">{t('NIK')}</Label>
                  <Input
                    id="nik"
                    placeholder={t('Employee ID Number')}
                    value={data.nik || ''}
                    onChange={(e) => setData('nik', e.target.value)}
                    className={errors.nik ? 'border-red-500' : ''}
                  />
                  {errors.nik && <p className="text-sm text-red-500 mt-2">{errors.nik}</p>}
                </div>

                {/* Personal Email */}
                <div>
                  <Label htmlFor="personal_email" className="mb-2 block">{t('Personal Email')}</Label>
                  <Input
                    id="personal_email"
                    type="email"
                    placeholder="personal@example.com"
                    value={data.personal_email || ''}
                    onChange={(e) => setData('personal_email', e.target.value)}
                    className={errors.personal_email ? 'border-red-500' : ''}
                  />
                  {errors.personal_email && <p className="text-sm text-red-500 mt-2">{errors.personal_email}</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <Label htmlFor="phone_number" className="mb-2 block">{t('Phone Number')}</Label>
                  <Input
                    id="phone_number"
                    placeholder="+6281234567890"
                    value={data.phone_number || ''}
                    onChange={(e) => setData('phone_number', e.target.value)}
                    className={errors.phone_number ? 'border-red-500' : ''}
                  />
                  {errors.phone_number && <p className="text-sm text-red-500 mt-2">{errors.phone_number}</p>}
                </div>

                {/* Address */}
                <div>
                  <Label htmlFor="address" className="mb-2 block">{t('Address')}</Label>
                  <Textarea
                    id="address"
                    placeholder={t('Employee address')}
                    value={data.address || ''}
                    onChange={(e) => setData('address', e.target.value)}
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && <p className="text-sm text-red-500 mt-2">{errors.address}</p>}
                </div>

                {/* Manager ID */}
                <div>
                  <Label htmlFor="manager_id" className="mb-2 block">{t('Reports To')}</Label>
                  <Select
                    value={data.manager_id ? String(data.manager_id) : '-1'}
                    onValueChange={(value) => setData('manager_id', value === '-1' ? null : Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select Manager')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">{t('— None —')}</SelectItem>
                      {potentialManagers.map((manager) => (
                        <SelectItem key={manager.id} value={String(manager.id)}>
                          {manager.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.manager_id && <p className="text-sm text-red-500 mt-2">{errors.manager_id}</p>}
                </div>

                {/* Division ID */}
                <div>
                  <Label htmlFor="division_id" className="mb-2 block">{t('Division')}</Label>
                  <Select
                    value={data.division_id ? String(data.division_id) : '-1'}
                    onValueChange={(value) => setData('division_id', value === '-1' ? null : Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select Division')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">{t('— None —')}</SelectItem>
                      {divisions.map((division) => (
                        <SelectItem key={division.id} value={String(division.id)}>
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.division_id && <p className="text-sm text-red-500 mt-2">{errors.division_id}</p>}
                </div>

                {/* Location (Site/Branch/Company) */}
                <div>
                  <Label htmlFor="location_id" className="mb-2 block">{t('Location')}</Label>
                  <Select
                    value={data.location_id ? String(data.location_id) : '-1'}
                    onValueChange={(value) => setData('location_id', value === '-1' ? null : Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select Location')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">{t('— None —')}</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={String(loc.id)}>
                          {loc.name} ({loc.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location_id && <p className="text-sm text-red-500 mt-2">{errors.location_id}</p>}
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="mb-2 block">{t('Password')} {isEdit ? t('(Optional)') : ''}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && <p className="text-sm text-red-500 mt-2">{errors.password}</p>}
                </div>

                {/* Roles */}
                <div>
                  <Label className="mb-3 block">{t('Roles')}</Label>
                  <div className="space-y-3 border rounded-lg p-4">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={data.roles.includes(role.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setData('roles', [...data.roles, role.name]);
                            } else {
                              setData('roles', data.roles.filter(r => r !== role.name));
                            }
                          }}
                        />
                        <Label htmlFor={`role-${role.id}`} className="text-sm font-normal cursor-pointer">
                          {role.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.roles && <p className="text-sm text-red-500 mt-2">{errors.roles}</p>}
                </div>
              </div>

              <Separator />

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <Link href="/employees" className="w-full sm:w-auto">
                  <Button type="button" variant="secondary" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" /> {t('Back')}
                  </Button>
                </Link>
                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  {processing
                    ? <span className="animate-pulse">{t('Saving...')}</span>
                    : isEdit
                      ? t('Save Changes')
                      : t('Create Employee')
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}