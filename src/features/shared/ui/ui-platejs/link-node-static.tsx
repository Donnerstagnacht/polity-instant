import type { SlateElementProps, TLinkElement } from 'platejs';

import { SlateElement } from 'platejs';

export function LinkElementStatic(props: SlateElementProps<TLinkElement>) {
  return (
    <SlateElement
      {...props}
      as="a"
      className="text-primary decoration-primary font-medium underline underline-offset-4"
    >
      {props.children}
    </SlateElement>
  );
}
