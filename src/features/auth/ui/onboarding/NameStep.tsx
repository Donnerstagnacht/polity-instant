'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, User } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface NameStepProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onNext: () => void;
  isLoading?: boolean;
}

export function NameStep({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  onNext,
  isLoading,
}: NameStepProps) {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});

  const validate = (): boolean => {
    const newErrors: { firstName?: string; lastName?: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = t('onboarding.nameStep.validation.required');
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = t('onboarding.nameStep.validation.tooShort');
    } else if (firstName.trim().length > 50) {
      newErrors.firstName = t('onboarding.nameStep.validation.tooLong');
    }

    if (!lastName.trim()) {
      newErrors.lastName = t('onboarding.nameStep.validation.required');
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = t('onboarding.nameStep.validation.tooShort');
    } else if (lastName.trim().length > 50) {
      newErrors.lastName = t('onboarding.nameStep.validation.tooLong');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
            <User className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">{t('onboarding.nameStep.title')}</h2>
        <p className="mt-2 text-muted-foreground">{t('onboarding.nameStep.description')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t('onboarding.nameStep.firstName')}</Label>
          <Input
            id="firstName"
            type="text"
            placeholder={t('onboarding.nameStep.firstNamePlaceholder')}
            value={firstName}
            onChange={e => {
              onFirstNameChange(e.target.value);
              if (errors.firstName) setErrors(prev => ({ ...prev, firstName: undefined }));
            }}
            disabled={isLoading}
            className={errors.firstName ? 'border-destructive' : ''}
            autoFocus
          />
          {errors.firstName && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-sm">{errors.firstName}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">{t('onboarding.nameStep.lastName')}</Label>
          <Input
            id="lastName"
            type="text"
            placeholder={t('onboarding.nameStep.lastNamePlaceholder')}
            value={lastName}
            onChange={e => {
              onLastNameChange(e.target.value);
              if (errors.lastName) setErrors(prev => ({ ...prev, lastName: undefined }));
            }}
            disabled={isLoading}
            className={errors.lastName ? 'border-destructive' : ''}
          />
          {errors.lastName && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-sm">{errors.lastName}</AlertDescription>
            </Alert>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {t('onboarding.nameStep.continue')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
