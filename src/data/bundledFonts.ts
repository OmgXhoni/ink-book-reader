export interface BundledFontVariant {
  label: string
  fileName: string
  weight: number
  style: 'normal' | 'italic'
  format: 'ttf' | 'otf'
}

export interface BundledFontFamily {
  id: string
  name: string
  isVariable: boolean
  variableFiles?: {
    upright?: string
    italic?: string
    weightRange: [number, number]
  }
  variants: BundledFontVariant[]
}

export const BUNDLED_FONT_FAMILIES: BundledFontFamily[] = [
  {
    id: 'baskerville-old-face',
    name: 'Baskerville Old Face',
    isVariable: false,
    variants: [
      { label: 'Regular', fileName: 'BASKVILL.ttf', weight: 400, style: 'normal', format: 'ttf' },
    ],
  },
  {
    id: 'coolvetica',
    name: 'Coolvetica',
    isVariable: false,
    variants: [
      { label: 'Regular', fileName: 'coolvetica rg.otf', weight: 400, style: 'normal', format: 'otf' },
      { label: 'Italic', fileName: 'coolvetica rg it.otf', weight: 400, style: 'italic', format: 'otf' },
      { label: 'Condensed', fileName: 'coolvetica condensed rg.otf', weight: 400, style: 'normal', format: 'otf' },
      { label: 'Compressed Heavy', fileName: 'coolvetica compressed hv.otf', weight: 900, style: 'normal', format: 'otf' },
      { label: 'Crammed', fileName: 'coolvetica crammed rg.otf', weight: 400, style: 'normal', format: 'otf' },
    ],
  },
  {
    id: 'courier',
    name: 'Courier Prime',
    isVariable: false,
    variants: [
      { label: 'Regular', fileName: 'CourierPrime-Regular.ttf', weight: 400, style: 'normal', format: 'ttf' },
      { label: 'Bold', fileName: 'CourierPrime-Bold.ttf', weight: 700, style: 'normal', format: 'ttf' },
      { label: 'Italic', fileName: 'CourierPrime-Italic.ttf', weight: 400, style: 'italic', format: 'ttf' },
      { label: 'Bold Italic', fileName: 'CourierPrime-BoldItalic.ttf', weight: 700, style: 'italic', format: 'ttf' },
    ],
  },
  {
    id: 'eb-garamond',
    name: 'EB Garamond',
    isVariable: true,
    variableFiles: {
      upright: 'EBGaramond-VariableFont_wght.ttf',
      italic: 'EBGaramond-Italic-VariableFont_wght.ttf',
      weightRange: [400, 800],
    },
    variants: [
      { label: 'Regular', fileName: 'EBGaramond-VariableFont_wght.ttf', weight: 400, style: 'normal', format: 'ttf' },
      { label: 'Medium', fileName: 'EBGaramond-VariableFont_wght.ttf', weight: 500, style: 'normal', format: 'ttf' },
      { label: 'SemiBold', fileName: 'EBGaramond-VariableFont_wght.ttf', weight: 600, style: 'normal', format: 'ttf' },
      { label: 'Bold', fileName: 'EBGaramond-VariableFont_wght.ttf', weight: 700, style: 'normal', format: 'ttf' },
      { label: 'ExtraBold', fileName: 'EBGaramond-VariableFont_wght.ttf', weight: 800, style: 'normal', format: 'ttf' },
    ],
  },
  {
    id: 'futura',
    name: 'Futura',
    isVariable: false,
    variants: [
      { label: 'Light', fileName: 'FuturaCyrillicLight.ttf', weight: 300, style: 'normal', format: 'ttf' },
      { label: 'Book', fileName: 'FuturaCyrillicBook.ttf', weight: 400, style: 'normal', format: 'ttf' },
      { label: 'Medium', fileName: 'FuturaCyrillicMedium.ttf', weight: 500, style: 'normal', format: 'ttf' },
      { label: 'Demi', fileName: 'FuturaCyrillicDemi.ttf', weight: 600, style: 'normal', format: 'ttf' },
      { label: 'Bold', fileName: 'FuturaCyrillicBold.ttf', weight: 700, style: 'normal', format: 'ttf' },
      { label: 'ExtraBold', fileName: 'FuturaCyrillicExtraBold.ttf', weight: 800, style: 'normal', format: 'ttf' },
      { label: 'Heavy', fileName: 'FuturaCyrillicHeavy.ttf', weight: 900, style: 'normal', format: 'ttf' },
    ],
  },
  {
    id: 'google-sans-flex',
    name: 'Google Sans Flex',
    isVariable: true,
    variableFiles: {
      upright: 'GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf',
      weightRange: [100, 900],
    },
    variants: [
      { label: 'Thin', fileName: 'GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf', weight: 100, style: 'normal', format: 'ttf' },
      { label: 'Light', fileName: 'GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf', weight: 300, style: 'normal', format: 'ttf' },
      { label: 'Regular', fileName: 'GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf', weight: 400, style: 'normal', format: 'ttf' },
      { label: 'Medium', fileName: 'GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf', weight: 500, style: 'normal', format: 'ttf' },
      { label: 'Bold', fileName: 'GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf', weight: 700, style: 'normal', format: 'ttf' },
      { label: 'Black', fileName: 'GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf', weight: 900, style: 'normal', format: 'ttf' },
    ],
  },
  {
    id: 'helvetica',
    name: 'Helvetica',
    isVariable: false,
    variants: [
      { label: 'Light', fileName: 'helvetica-light-587ebe5a59211.ttf', weight: 300, style: 'normal', format: 'ttf' },
      { label: 'Regular', fileName: 'Helvetica.ttf', weight: 400, style: 'normal', format: 'ttf' },
      { label: 'Bold', fileName: 'Helvetica-Bold.ttf', weight: 700, style: 'normal', format: 'ttf' },
      { label: 'Oblique', fileName: 'Helvetica-Oblique.ttf', weight: 400, style: 'italic', format: 'ttf' },
      { label: 'Bold Oblique', fileName: 'Helvetica-BoldOblique.ttf', weight: 700, style: 'italic', format: 'ttf' },
      { label: 'Compressed', fileName: 'helvetica-compressed-5871d14b6903a.otf', weight: 400, style: 'normal', format: 'otf' },
      { label: 'Rounded Bold', fileName: 'helvetica-rounded-bold-5871d05ead8de.otf', weight: 700, style: 'normal', format: 'otf' },
    ],
  },
  {
    id: 'jura',
    name: 'Jura',
    isVariable: true,
    variableFiles: {
      upright: 'Jura-VariableFont_wght.ttf',
      weightRange: [300, 700],
    },
    variants: [
      { label: 'Light', fileName: 'Jura-VariableFont_wght.ttf', weight: 300, style: 'normal', format: 'ttf' },
      { label: 'Regular', fileName: 'Jura-VariableFont_wght.ttf', weight: 400, style: 'normal', format: 'ttf' },
      { label: 'Medium', fileName: 'Jura-VariableFont_wght.ttf', weight: 500, style: 'normal', format: 'ttf' },
      { label: 'SemiBold', fileName: 'Jura-VariableFont_wght.ttf', weight: 600, style: 'normal', format: 'ttf' },
      { label: 'Bold', fileName: 'Jura-VariableFont_wght.ttf', weight: 700, style: 'normal', format: 'ttf' },
    ],
  },
  {
    id: 'nilland',
    name: 'Nilland',
    isVariable: false,
    variants: [
      { label: 'Regular', fileName: 'Nilland.ttf', weight: 400, style: 'normal', format: 'ttf' },
      { label: 'Bold', fileName: 'Nilland-Bold.ttf', weight: 700, style: 'normal', format: 'ttf' },
      { label: 'ExtraBold', fileName: 'Nilland-ExtraBold.ttf', weight: 800, style: 'normal', format: 'ttf' },
      { label: 'Black', fileName: 'Nilland-Black.ttf', weight: 900, style: 'normal', format: 'ttf' },
      { label: 'Small Caps', fileName: 'Nilland-SmallCaps.ttf', weight: 400, style: 'normal', format: 'ttf' },
      { label: 'Small Caps Bold', fileName: 'Nilland-SmallCaps-Bold.ttf', weight: 700, style: 'normal', format: 'ttf' },
    ],
  },
  {
    id: 'paralucent',
    name: 'Paralucent',
    isVariable: false,
    variants: [
      // Regular
      { label: 'Thin', fileName: 'ParalucentThin.otf', weight: 100, style: 'normal', format: 'otf' },
      { label: 'ExtraLight', fileName: 'ParalucentExtraLight.otf', weight: 200, style: 'normal', format: 'otf' },
      { label: 'Medium', fileName: 'ParalucentMedium.otf', weight: 500, style: 'normal', format: 'otf' },
      { label: 'DemiBold', fileName: 'ParalucentDemiBold 2.otf', weight: 600, style: 'normal', format: 'otf' },
      { label: 'Bold', fileName: 'ParalucentBold.otf', weight: 700, style: 'normal', format: 'otf' },
      { label: 'Heavy', fileName: 'ParalucentHeavy.otf', weight: 900, style: 'normal', format: 'otf' },
      // Condensed
      { label: 'Cond Thin', fileName: 'ParalucentCondThin.otf', weight: 100, style: 'normal', format: 'otf' },
      { label: 'Cond ExtraLight', fileName: 'ParalucentCondExtraLight 2.otf', weight: 200, style: 'normal', format: 'otf' },
      { label: 'Cond Light', fileName: 'ParalucentCondLight.otf', weight: 300, style: 'normal', format: 'otf' },
      { label: 'Cond Medium', fileName: 'ParalucentCondMedium.otf', weight: 500, style: 'normal', format: 'otf' },
      { label: 'Cond DemiBold', fileName: 'ParalucentCondDemiBold.otf', weight: 600, style: 'normal', format: 'otf' },
      { label: 'Cond DemiBold Italic', fileName: 'ParalucentCondDemiBoldIt.otf', weight: 600, style: 'italic', format: 'otf' },
      { label: 'Cond Bold', fileName: 'ParalucentCondBold.otf', weight: 700, style: 'normal', format: 'otf' },
      { label: 'Cond Heavy', fileName: 'ParalucentCondHeavy.otf', weight: 900, style: 'normal', format: 'otf' },
      // Stencil
      { label: 'Stencil ExtraLight', fileName: 'ParalucentStencilExtraLight.otf', weight: 200, style: 'normal', format: 'otf' },
      { label: 'Stencil Medium', fileName: 'ParalucentStencilMedium.otf', weight: 500, style: 'normal', format: 'otf' },
      { label: 'Stencil Heavy', fileName: 'ParalucentStencilHeavy.otf', weight: 900, style: 'normal', format: 'otf' },
      // Text
      { label: 'Text Book', fileName: 'ParalucentTextBook.otf', weight: 400, style: 'normal', format: 'otf' },
      { label: 'Text Bold', fileName: 'ParalucentTextBold.otf', weight: 700, style: 'normal', format: 'otf' },
    ],
  },
  {
    id: 'roboto',
    name: 'Roboto',
    isVariable: true,
    variableFiles: {
      upright: 'Roboto-VariableFont_wdth,wght.ttf',
      italic: 'Roboto-Italic-VariableFont_wdth,wght.ttf',
      weightRange: [100, 900],
    },
    variants: [
      { label: 'Thin', fileName: 'Roboto-VariableFont_wdth,wght.ttf', weight: 100, style: 'normal', format: 'ttf' },
      { label: 'Light', fileName: 'Roboto-VariableFont_wdth,wght.ttf', weight: 300, style: 'normal', format: 'ttf' },
      { label: 'Regular', fileName: 'Roboto-VariableFont_wdth,wght.ttf', weight: 400, style: 'normal', format: 'ttf' },
      { label: 'Medium', fileName: 'Roboto-VariableFont_wdth,wght.ttf', weight: 500, style: 'normal', format: 'ttf' },
      { label: 'Bold', fileName: 'Roboto-VariableFont_wdth,wght.ttf', weight: 700, style: 'normal', format: 'ttf' },
      { label: 'Black', fileName: 'Roboto-VariableFont_wdth,wght.ttf', weight: 900, style: 'normal', format: 'ttf' },
    ],
  },
  {
    id: 'urbanist',
    name: 'Urbanist',
    isVariable: true,
    variableFiles: {
      upright: 'Urbanist-VariableFont_wght.ttf',
      italic: 'Urbanist-Italic-VariableFont_wght.ttf',
      weightRange: [100, 900],
    },
    variants: [
      { label: 'Thin', fileName: 'Urbanist-VariableFont_wght.ttf', weight: 100, style: 'normal', format: 'ttf' },
      { label: 'Light', fileName: 'Urbanist-VariableFont_wght.ttf', weight: 300, style: 'normal', format: 'ttf' },
      { label: 'Regular', fileName: 'Urbanist-VariableFont_wght.ttf', weight: 400, style: 'normal', format: 'ttf' },
      { label: 'Medium', fileName: 'Urbanist-VariableFont_wght.ttf', weight: 500, style: 'normal', format: 'ttf' },
      { label: 'SemiBold', fileName: 'Urbanist-VariableFont_wght.ttf', weight: 600, style: 'normal', format: 'ttf' },
      { label: 'Bold', fileName: 'Urbanist-VariableFont_wght.ttf', weight: 700, style: 'normal', format: 'ttf' },
      { label: 'Black', fileName: 'Urbanist-VariableFont_wght.ttf', weight: 900, style: 'normal', format: 'ttf' },
    ],
  },
]
