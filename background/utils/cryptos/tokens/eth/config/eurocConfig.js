export default {
  address: {
    homestead: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
    goerli: '0xA683d909e996052955500DDc45CA13E25c76e286'
  },
  abi: [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'implementationContract',
          type: 'address'
        }
      ],
      stateMutability: 'nonpayable',
      type: 'constructor'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'previousAdmin',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'newAdmin',
          type: 'address'
        }
      ],
      name: 'AdminChanged',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'implementation',
          type: 'address'
        }
      ],
      name: 'Upgraded',
      type: 'event'
    },
    { stateMutability: 'payable', type: 'fallback' },
    {
      inputs: [],
      name: 'admin',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: 'newAdmin', type: 'address' }],
      name: 'changeAdmin',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'implementation',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'newImplementation', type: 'address' }
      ],
      name: 'upgradeTo',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'newImplementation', type: 'address' },
        { internalType: 'bytes', name: 'data', type: 'bytes' }
      ],
      name: 'upgradeToAndCall',
      outputs: [],
      stateMutability: 'payable',
      type: 'function'
    }
  ]
}
