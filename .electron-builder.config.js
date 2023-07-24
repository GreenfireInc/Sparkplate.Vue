module.exports = {
  appId: 'com.sparkplate.app',
  productName: 'Sparkplate',
  copyright: '2023',
  directories: {
    output: 'dist_electron'
  },
  files: [
    'dist/**/*',
    '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
    '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
    '!**/node_modules/*.d.ts',
    '!**/node_modules/.bin',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.editorconfig',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
    '!**/{appveyor.yml,.travis.yml,circle.yml}',
    '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}',
    '!**/{.env*}'
  ],
  linux: {
    category: 'Office',
    target: [
      {
        target: 'deb',
        arch: ['x64']
      },
      {
        target: 'rpm',
        arch: ['x64']
      },
      {
        target: 'AppImage',
        arch: ['x64']
      },
      {
        target: 'snap',
        arch: ['x64']
      },
      {
        target: 'flatpak',
        arch: ['x64']
      }
    ],
    icon: './icons/'
  },
  mac: {
    category: 'public.app-category.office',
    target: [
      {
        target: 'dmg',
        arch: ['x64']
      }
    ],
    icon: './icon.icns',
    hardenedRuntime: true,
    entitlements: 'entitlements.mac.plist',
    extendInfo: {
      NSMicrophoneUsageDescription: 'Please give us access to your microphone'
    }
  },
  win: {
    target: [
      {
        target: 'msi',
        arch: ['x64']
      }
    ],
    icon: './build/icon.ico'
  }
}
