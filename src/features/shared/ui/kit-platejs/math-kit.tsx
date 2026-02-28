import { EquationPlugin, InlineEquationPlugin } from '@platejs/math/react';

import { EquationElement, InlineEquationElement } from '@/features/shared/ui/ui-platejs/equation-node.tsx';

export const MathKit = [
  InlineEquationPlugin.withComponent(InlineEquationElement),
  EquationPlugin.withComponent(EquationElement),
];
