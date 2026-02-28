import type { SlateElementProps, TDateElement } from 'platejs';

import { SlateElement } from 'platejs';
import { useTranslation } from 'react-i18next';

export function DateElementStatic(props: SlateElementProps<TDateElement>) {
  const { element } = props;
  const { t } = useTranslation();

  return (
    <SlateElement className="inline-block" {...props}>
      <span className="bg-muted text-muted-foreground w-fit rounded-sm px-1">
        {element.date ? (
          (() => {
            const today = new Date();
            const elementDate = new Date(element.date);
            const isToday =
              elementDate.getDate() === today.getDate() &&
              elementDate.getMonth() === today.getMonth() &&
              elementDate.getFullYear() === today.getFullYear();

            const isYesterday =
              new Date(today.setDate(today.getDate() - 1)).toDateString() ===
              elementDate.toDateString();
            const isTomorrow =
              new Date(today.setDate(today.getDate() + 2)).toDateString() ===
              elementDate.toDateString();

            if (isToday) return t('dateElement.today');
            if (isYesterday) return t('dateElement.yesterday');
            if (isTomorrow) return t('dateElement.tomorrow');

            return elementDate.toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
          })()
        ) : (
          <span>{t('dateElement.pickDate')}</span>
        )}
      </span>
      {props.children}
    </SlateElement>
  );
}
