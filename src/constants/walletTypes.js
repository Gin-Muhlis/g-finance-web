/** Filter tabs for wallet list — `apiType` is sent to GET /api/wallets as `type`. */
export const WALLET_TYPE_TABS = [
  { id: 'cash', label: 'Tunai', apiType: 'cash', activeStyle: 'orange' },
  { id: 'bank', label: 'Rekening bank', apiType: 'bank', activeStyle: 'orange' },
  {
    id: 'e-wallet',
    label: 'Dompet digital',
    apiType: 'e-wallet',
    activeStyle: 'orange',
  },
]
