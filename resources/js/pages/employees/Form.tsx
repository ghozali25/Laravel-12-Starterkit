import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BreadcrumbItem } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n';
import { Save, ArrowLeft } from 'lucide-react';

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
  roles?: string[];
}

interface Props {
  employee?: Employee;
  roles: Role[];
  currentRoles?: string[];
}

export default function EmployeeForm({ employee, roles, currentRoles }: Props) {
  const { t } = useTranslation();
  const isEdit = !!employee;

  const { data, setData, post, put, processing, errors } = useForm({
    name: employee?.name || '',
    email: employee?.email || '',
    nik: employee?.nik || '',
    personal_email: employee?.personal_email || '',
    phone_number: employee?.phone_number || '',
    address: employee?.address || '',
    password: '',
    roles: currentRoles || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    isEdit ? put(`/employees/${employee?.id}`) : post('/employees');
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
          </CardHeader>

          <Separator />

          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
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