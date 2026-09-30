export type TextEditorTarget = 'main' | 'text' | 'header' | 'footer';
export type TextTemplateType = 'ecommerce' | 'portfolio';

export interface TextStyles {
  color: string;
  fontSize: string;
  fontFamily: string;
}

export interface TextSectionProps {
  alignment: 'left' | 'center' | 'right';
  backgroundColor: string;
  headerBg: string;
  headerText: string;
  footerBg: string;
  footerText: string;
  shadow: boolean;
}

export interface TextBlockState {
  section: TextSectionProps;
  textStyles: TextStyles;
  selectedTarget: TextEditorTarget;
  isTextEditable: boolean;
}
