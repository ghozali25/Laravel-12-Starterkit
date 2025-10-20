import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Save, ArrowLeft } from 'lucide-react';
import { BreadcrumbItem, type Asset, type AssetCategory, type User } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AssetFormProps {
  asset?: Asset;
  categories: AssetCategory[];
  employees: User[];
}

export default function AssetForm({ asset, categories, employees }: AssetFormProps) {
  const { t } = useTranslation();
  const isEdit = !!asset;

  const { data, setData, post, put, processing, errors } = useForm({
    asset_category_id: asset?.asset_category_id || '',
    user_id: asset?.user_id || null,
    serial_number: asset?.serial_number || '',
    brand: asset?.brand || '',
    model: asset?.model || '',
    purchase_date: asset?.purchase_date || '',
    warranty_end_date: asset?.warranty_end_date || '',
    status: asset?.status || 'available',
    notes: asset?.notes || '',
    custom_fields_data: asset?.custom_fields_data || {},
  });

  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(
    categories.find(cat => cat.id === asset?.asset_category_id) || null
  );

  useEffect(() => {
    if (data.asset_category_id) {
      const category = categories.find(cat => cat.id === Number(data.asset_category_id));
      setSelectedCategory(category || null);
      
      // Reset custom fields if category changes and it's not an edit of the same category
      if (category && category.id !== asset?.asset_category_id) {
        setData('custom_fields_data', {});
      }
    } else {
      setSelectedCategory(null);
      setData('custom_fields_data', {});
    }
  }, [data.asset_category_id, categories, asset?.asset_category_id]);

  const handleCustomFieldChange = (key: string, value: any) => {
    setData('custom_fields_data', {
      ...data.custom_fields_data,
      [key]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...data,
      asset_category_id: Number(data.asset_category_id),
      user_id: data.user_id === null ? null : Number(data.user_id),
    };

    if (isEdit) {
      router.put(`/assets/${asset?.id}`, payload);
    } else {
      router.post('/assets', payload);
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Assets List'), href: '/assets' },
    { title: isEdit ? t('Edit Asset') : t('Add Asset'), href: '#' },
  ];

  const assetStatuses = [
    { value: 'available', label: t('Available') },
    { value: 'assigned', label: t('Assigned') },
    { value: 'in_repair', label: t('In Repair') },
    { value: 'retired', label: t('Retired') },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? t('Edit Asset') : t('Add Asset')} />

      <div className="flex-1 p-4 md:p-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {isEdit ? t('Edit Asset') : t('Add Asset')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isEdit ? t('Edit asset details') : t('Create a new asset and assign it to an employee.')}
            </p>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Asset Category */}
              <div className="space-y-2">
                <Label htmlFor="asset_category_id">{t('Asset Category')}</Label>
                <Select
                  value={String(data.asset_category_id)}
                  onValueChange={(value) => setData('asset_category_id', value)}
                >
                  <SelectTrigger id="asset_category_id">
                    <SelectValue placeholder={t('Select an asset category')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.asset_category_id && <p className="text-sm text-red-500">{errors.asset_category_id}</p>}
              </div>

              {/* Assigned To (Employee) */}
              <div className="space-y-2">
                <Label htmlFor="user_id">{t('Assigned To (Employee)')}</Label>
                <Select
                  value={data.user_id ? String(data.user_id) : '-1'}
                  onValueChange={(value) => setData('user_id', value === '-1' ? null : Number(value))}
                >
                  <SelectTrigger id="user_id">
                    <SelectValue placeholder={t('Select an employee')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">{t('— None —')}</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={String(employee.id)}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.user_id && <p className="text-sm text-red-500">{errors.user_id}</p>}
              </div>

              {/* Serial Number */}
              <div className="space-y-2">
                <Label htmlFor="serial_number">{t('Serial Number')}</Label>
                <Input
                  id="serial_number"
                  placeholder={t('Enter serial number')}
                  value={data.serial_number || ''}
                  onChange={(e) => setData('serial_number', e.target.value)}
                  className={errors.serial_number ? 'border-red-500' : ''}
                />
                {errors.serial_number && <p className="text-sm text-red-500">{errors.serial_number}</p>}
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <Label htmlFor="brand">{t('Brand')}</Label>
                <Input
                  id="brand"
                  placeholder={t('Enter brand')}
                  value={data.brand || ''}
                  onChange={(e) => setData('brand', e.target.value)}
                  className={errors.brand ? 'border-red-500' : ''}
                />
                {errors.brand && <p className="text-sm text-red-500">{errors.brand}</p>}
              </div>

              {/* Model */}
              <div className="space-y-2">
                <Label htmlFor="model">{t('Model')}</Label>
                <Input
                  id="model"
                  placeholder={t('Enter model')}
                  value={data.model || ''}
                  onChange={(e) => setData('model', e.target.value)}
                  className={errors.model ? 'border-red-500' : ''}
                />
                {errors.model && <p className="text-sm text-red-500">{errors.model}</p>}
              </div>

              {/* Purchase Date */}
              <div className="space-y-2">
                <Label htmlFor="purchase_date">{t('Purchase Date')}</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={data.purchase_date || ''}
                  onChange={(e) => setData('purchase_date', e.target.value)}
                  className={errors.purchase_date ? 'border-red-500' : ''}
                />
                {errors.purchase_date && <p className="text-sm text-red-500">{errors.purchase_date}</p>}
              </div>

              {/* Warranty End Date */}
              <div className="space-y-2">
                <Label htmlFor="warranty_end_date">{t('Warranty End Date')}</Label>
                <Input
                  id="warranty_end_date"
                  type="date"
                  value={data.warranty_end_date || ''}
                  onChange={(e) => setData('warranty_end_date', e.target.value)}
                  className={errors.warranty_end_date ? 'border-red-500' : ''}
                />
                {errors.warranty_end_date && <p className="text-sm text-red-500">{errors.warranty_end_date}</p>}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">{t('Status')}</Label>
                <Select
                  value={data.status}
                  onValueChange={(value) => setData('status', value as 'available' | 'assigned' | 'in_repair' | 'retired')}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder={t('Select status')} />
                  </SelectTrigger>
                  <SelectContent>
                    {assetStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">{t('Notes')}</Label>
                <Textarea
                  id="notes"
                  placeholder={t('Any additional notes about the asset')}
                  value={data.notes || ''}
                  onChange={(e) => setData('notes', e.target.value)}
                  className={errors.notes ? 'border-red-500' : ''}
                />
                {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
              </div>

              {/* Dynamic Custom Fields */}
              {selectedCategory && selectedCategory.custom_fields_schema && Object.keys(selectedCategory.custom_fields_schema).length > 0 && (
                <>
                  <Separator />
                  <h3 className="text-lg font-semibold">{t('Custom Fields')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedCategory.custom_fields_schema).map(([key, fieldDef]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`custom_field_${key}`}>{t(fieldDef.label || key)}</Label>
                        {fieldDef.type === 'text' && (
                          <Input
                            id={`custom_field_${key}`}
                            type="text"
                            value={data.custom_fields_data[key] || ''}
                            onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                          />
                        )}
                        {fieldDef.type === 'number' && (
                          <Input
                            id={`custom_field_${key}`}
                            type="number"
                            value={data.custom_fields_data[key] || ''}
                            onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                          />
                        )}
                        {/* Add more field types as needed (e.g., date, select, checkbox) */}
                        {(errors as Record<string, any>)[`custom_fields_data.${key}`] && <p className="text-sm text-red-500">{(errors as Record<string, any>)[`custom_fields_data.${key}`]}</p>}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Link href="/assets">
                  <Button type="button" variant="secondary">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('Back')}
                  </Button>
                </Link>
                <Button type="submit" disabled={processing} >
                  <Save className="mr-2 h-4 w-4" />
                  {processing
                    ? isEdit
                      ? t('Saving...')
                      : t('Adding...')
                    : isEdit
                    ? t('Save Changes')
                    : t('Add')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}