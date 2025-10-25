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

interface Props {
  employee?: Employee;
  roles: Role[];
  currentRoles?: string[];
  potentialManagers: PotentialManager[];
  divisions: Division[];
  avatar_url?: string | null; // Existing avatar URL
}

export default function EmployeeForm({ employee, roles, currentRoles, potentialManagers, divisions, avatar_url }: Props) {
  const { t } = useTranslation();
  const isEdit = !!employee;
  const page = usePage();
  const isAdmin = Boolean((page.props as any)?.auth?.is_admin);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatar_url || null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const { data, setData, post, put, processing, errors } = useForm({
    name: employee?.name || '',
    email: employee?.email || '',
    nik: employee?.nik || '',
    personal_email: employee?.personal_email || '',
    phone_number: employee?.phone_number || '',
    address: employee?.address || '',
    manager_id: employee?.manager_id || null,
    division_id: employee?.division_id || null,
    password: '',
    roles: currentRoles || [],
    avatar: null as File | null, // For new avatar file
    remove_avatar: false as boolean, // Flag to tell backend to remove avatar
  });

  const handleAvatarSelected = (file: File | null) => {
    setData('avatar', file);
    setData('remove_avatar', false);
    if (file) setAvatarPreview(URL.createObjectURL(file));
    else setAvatarPreview(null);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setData('avatar', null); // Clear file input
    setData('remove_avatar', true); // Set flag for backend
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...data, remove_avatar: removeAvatar }; // Include remove_avatar flag
    if (isEdit) {
      put(`/employees/${employee?.id}`, submitData as any); // Cast to any to allow File type
    } else {
      post('/employees', submitData as any); // Cast to any to allow File type
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