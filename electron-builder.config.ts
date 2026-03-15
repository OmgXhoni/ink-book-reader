import type { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'com.ink.bookreader',
  productName: 'Ink Book Reader',
  directories: {
    output: 'release',
    buildResources: 'assets',
  },
  files: [
    'dist/**/*',
    'dist-electron/**/*',
    'assets/**/*',
  ],
  win: {
    target: ['nsis', 'portable'],
    icon: 'assets/icons/icon.ico',
    artifactName: '${productName}-${version}-Setup.${ext}',
  },
  mac: {
    target: ['dmg'],
    category: 'public.app-category.books',
    icon: 'assets/icons/icon.icns',
  },
  linux: {
    target: ['AppImage'],
    icon: 'assets/icons/',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },
  publish: null,
}

export default config
