import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Save, ArrowLeft } from 'lucide-react';
import { BreadcrumbItem, type AssetCategory } from '@/types';
import { useTranslation } from '@/lib/i18n';

interface AssetCategoryFormProps {
  category?: AssetCategory;
}

export default function AssetCategoryForm({ category }: AssetCategoryFormProps) {
  const { t } = useTranslation();
  const isEdit = !!category;

  const { data, setData, processing, errors } = useForm({
    name: category?.name || '',
    description: category?.description || '',
    custom_fields_schema: JSON.stringify(category?.custom_fields_schema || {}, null, 2), // Prettify JSON
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate JSON before sending
    let parsedSchema = null;
    if (data.custom_fields_schema) {
      try {
        parsedSchema = JSON.parse(data.custom_fields_schema);
      } catch (jsonError) {
        alert(t('Invalid JSON in Custom Fields Schema. Please correct it.'));
        return;
      }
    }

    const payload = {
      name: data.name,
      description: data.description,
      custom_fields_schema: parsedSchema,
    };

    if (isEdit) {
      router.put(`/asset-categories/${category?.id}`, payload);
    } else {
      router.post('/asset-categories', payload);
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Asset Categories'), href: '/asset-categories' },
    { title: isEdit ? t('Edit Category') : t('Add Category'), href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? t('Edit Category') : t('Add Category')} />

      <div className="flex-1 p-4 md:p-6 max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {isEdit ? t('Edit Category') : t('Add Category')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isEdit ? t('Edit asset category details') : t('Create a new asset category and define its custom fields.')}
            </p>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('Category Name')}</Label>
                <Input
                  id="name"
                  placeholder="Example: Laptop, Vehicle, Mobile Phone"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('Description')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('Description for this asset category')}
                  value={data.description || ''}
                  onChange={(e) => setData('description', e.target.value)}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              {/* Custom Fields Schema (JSON) */}
              <div className="space-y-2">
                <Label htmlFor="custom_fields_schema">{t('Custom Fields Schema (JSON)')}</Label>
                <Textarea
                  id="custom_fields_schema"
                  placeholder={t('Enter JSON schema for custom fields (e.g., {"serial_number": {"type": "text", "label": "Serial Number"}})')}
                  value={data.custom_fields_schema || ''}
                  onChange={(e) => setData('custom_fields_schema', e.target.value)}
                  rows={8}
                  className={errors.custom_fields_schema ? 'border-red-500' : ''}
                />
                {errors.custom_fields_schema && <p className="text-sm text-red-500">{errors.custom_fields_schema}</p>}
                <p className="text-xs text-muted-foreground">
                  {t('Define additional fields for assets in this category using JSON. Example:')}
                  <pre className="bg-muted p-2 rounded mt-1 text-xs">
                    {`{\n  "processor": {"type": "text", "label": "Processor"},\n  "ram": {"type": "number", "label": "RAM (GB)"}\n}`}
                  </pre>
                </p>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Link href="/asset-categories">
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