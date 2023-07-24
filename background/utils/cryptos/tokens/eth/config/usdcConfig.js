export default {
  address: {
    homestead: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    goerli: '0x07865c6e87b9f70255377e024ace6630c1eaa37f'
  },
  implementation: {
    homestead: '0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf'
  },
  abi: [
    {
      constant: false,
      inputs: [{ name: 'newImplementation', type: 'address' }],
      name: 'upgradeTo',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        { name: 'newImplementation', type: 'address' },
        { name: 'data', type: 'bytes' }
      ],
      name: 'upgradeToAndCall',
      outputs: [],
      payable: true,
      stateMutability: 'payable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'implementation',
      outputs: [{ name: '', type: 'address' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [{ name: 'newAdmin', type: 'address' }],
      name: 'changeAdmin',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'admin',
      outputs: [{ name: '', type: 'address' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ name: '_implementation', type: 'address' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'constructor'
    },
    { payable: true, stateMutability: 'payable', type: 'fallback' },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: 'previousAdmin', type: 'address' },
        { indexed: false, name: 'newAdmin', type: 'address' }
      ],
      name: 'AdminChanged',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [{ indexed: false, name: 'implementation', type: 'address' }],
      name: 'Upgraded',
      type: 'event'
    }
  ]
}
