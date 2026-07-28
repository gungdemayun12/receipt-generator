import { useState, useRef, useCallback, useEffect } from 'react'
import './App.css'
import JsBarcode from 'jsbarcode'

const FONT_OPTIONS = [
  { name: 'Courier Prime (Default)', value: "'Courier Prime', 'Courier New', monospace" },
  { name: 'Inconsolata', value: "'Inconsolata', monospace" },
  { name: 'VT323 (Retro)', value: "'VT323', monospace" },
  { name: 'Space Mono', value: "'Space Mono', monospace" },
  { name: 'Share Tech Mono', value: "'Share Tech Mono', monospace" },
  { name: 'Courier New', value: "'Courier New', Courier, monospace" },
  { name: 'Arial', value: "Arial, sans-serif" },
  { name: 'Times New Roman', value: "'Times New Roman', serif" },
  { name: 'Georgia', value: "Georgia, serif" },
  { name: 'Verdana', value: "Verdana, sans-serif" },
  { name: 'Tahoma', value: "Tahoma, sans-serif" },
  { name: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
  { name: 'Consolas', value: "Consolas, monospace" },
  { name: 'Lucida Console', value: "'Lucida Console', monospace" },
]

const FONT_SIZES = [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24]
const CHAR_PER_LINE_OPTIONS = [24, 28, 32, 36, 40, 44, 48, 52, 56, 60]

const COLORS = [
  { name: 'Hitam', value: '#000000' },
  { name: 'Biru Tua', value: '#1a237e' },
  { name: 'Merah', value: '#c62828' },
  { name: 'Hijau', value: '#2e7d32' },
  { name: 'Ungu', value: '#6a1b9a' },
  { name: 'Orange', value: '#e65100' },
  { name: 'Biru', value: '#1565c0' },
  { name: 'Abu-abu', value: '#424242' },
  { name: 'Coklat', value: '#4e342e' },
  { name: 'Emas', value: '#b8860b' },
]

const UNITS = ['Pcs', 'Kg', 'Gr', 'Liter', 'Ml', 'Meter', 'Cm', 'Box', 'Pack', 'Sak', 'Botol', 'Karton', 'Lembar', 'Pasang', 'Buah', 'Ikat', 'Kilo', 'Ons', 'Dus', 'Karung', 'Bungkus', 'Kaleng', 'Toples', 'Batang', 'Lusin', 'Rim', 'Gulung']

const PAYMENT_METHODS = ['Tunai', 'QRIS/OVO/GoPay', 'Kartu Debit', 'Kartu Kredit', 'Transfer Bank', 'Bayar di Tempat']

const ALIGN_OPTIONS = [
  { name: 'Kiri', value: 'left' },
  { name: 'Tengah', value: 'center' },
  { name: 'Kanan', value: 'right' },
]

function App() {
  const [header, setHeader] = useState({
    storeName: 'TOKO ANDA',
    storeAddress: 'Jl. Contoh No. 123, RT 01 RW 02, Kelurahan\nKecamatan, Kota Anda 12345',
    storePhone: '(021) 1234-5678',
    storePhone2: '0812-3456-7890',
    storeEmail: 'tokoanda@email.com',
    storeWebsite: 'www.tokoanda.com',
    receiptTitle: 'STRUK BELANJA',
    receiptNumber: 'INV-001',
    date: new Date().toISOString().slice(0, 16),
    cashier: 'Admin',
    customer: '',
    customerAddress: '',
    customerPhone: '',
    note: '',
    footer: 'Terima kasih telah berbelanja di toko kami\nBarang yang sudah dibeli tidak dapat ditukar kembali\nSilakan cek kembali barang belanjaan Anda',
  })

  const [items, setItems] = useState([
    { id: 1, name: 'Barang 1', qty: 2, unit: 'Pcs', price: 15000 }
  ])

  const [settings, setSettings] = useState({
    paperSize: 58,
    fontFamily: "'Courier Prime', 'Courier New', monospace",
    fontSize: 12,
    fontColor: '#000000',
    showBarcode: true,
    align: 'center',
    charPerLine: 32,
    showCustomer: true,
    showCashier: true,
    showPaymentMethod: true,
    showChange: true,
    showThankYou: true,
    showLogo: false,
    logoText: '',
    borderStyle: 'equals', // equals, dashes, stars
  })

  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState('nominal')
  const [tax, setTax] = useState(0)
  const [taxType, setTaxType] = useState('percent')
  const [payment, setPayment] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('Tunai')

  const [tab, setTab] = useState('input')
  const [showSettings, setShowSettings] = useState(false)
  const [device, setDevice] = useState(null)
  const [connected, setConnected] = useState(false)
  const [notif, setNotif] = useState(null)
  const [showReset, setShowReset] = useState(false)
  const [receiptList, setReceiptList] = useState([])

  const barcodeRef = useRef(null)
  const nextId = useRef(2)

  const msg = useCallback((text, type = 'success') => {
    setNotif({ text, type })
    setTimeout(() => setNotif(null), 2500)
  }, [])

  // Generate barcode otomatis di preview
  useEffect(() => {
    if (barcodeRef.current && settings.showBarcode && header.receiptNumber) {
      try {
        JsBarcode(barcodeRef.current, header.receiptNumber, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: false,
          background: "#ffffff",
          lineColor: settings.fontColor === '#000000' ? '#000000' : settings.fontColor,
          margin: 0,
        })
      } catch { /* noop */ }
    }
  }, [settings.showBarcode, header.receiptNumber, settings.fontColor])

  const subtotal = items.reduce((s, i) => s + (i.qty * i.price), 0)
  const discVal = discountType === 'percent' ? subtotal * (discount / 100) : discount
  const taxVal = taxType === 'percent' ? (subtotal - discVal) * (tax / 100) : tax
  const total = Math.max(0, subtotal - discVal + taxVal)
  const change = payment > 0 ? payment - total : 0

  const fmt = (n) => {
    if (isNaN(n) || n === Infinity) return 'Rp0'
    return 'Rp' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const getBorderChar = () => {
    switch(settings.borderStyle) {
      case 'dashes': return '-'
      case 'stars': return '*'
      default: return '='
    }
  }

  const addItem = () => {
    setItems([...items, { id: nextId.current, name: '', qty: 1, unit: 'Pcs', price: 0 }])
    nextId.current++
  }

  const updItem = (id, field, val) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i))
  }

  const delItem = (id) => {
    if (items.length > 1) setItems(items.filter(i => i.id !== id))
  }

  const resetAll = () => {
    setHeader({
      storeName: 'TOKO ANDA',
      storeAddress: 'Jl. Contoh No. 123, RT 01 RW 02, Kelurahan\nKecamatan, Kota Anda 12345',
      storePhone: '(021) 1234-5678',
      storePhone2: '0812-3456-7890',
      storeEmail: 'tokoanda@email.com',
      storeWebsite: 'www.tokoanda.com',
      receiptTitle: 'STRUK BELANJA',
      receiptNumber: 'INV-001',
      date: new Date().toISOString().slice(0, 16),
      cashier: 'Admin',
      customer: '',
      customerAddress: '',
      customerPhone: '',
      note: '',
      footer: 'Terima kasih telah berbelanja di toko kami\nBarang yang sudah dibeli tidak dapat ditukar kembali\nSilakan cek kembali barang belanjaan Anda',
    })
    setItems([{ id: 1, name: 'Barang 1', qty: 2, unit: 'Pcs', price: 15000 }])
    setDiscount(0); setDiscountType('nominal')
    setTax(0); setTaxType('percent')
    setPayment(0); setPaymentMethod('Tunai')
    nextId.current = 2
    setShowReset(false)
    msg('Data direset')
  }

  // Save receipt to history
  const saveReceipt = () => {
    const data = { header, items, discount, discountType, tax, taxType, payment, paymentMethod, total, date: new Date().toISOString() }
    setReceiptList(prev => [data, ...prev].slice(0, 20))
    msg('Struk disimpan ke riwayat')
  }

  const exportData = () => {
    const data = { header, items, discount, discountType, tax, taxType, payment, paymentMethod, settings }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `receipt-${header.receiptNumber || 'data'}.json`
    a.click(); URL.revokeObjectURL(url)
    msg('Data di-export')
  }

  const importData = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result)
        if (d.header) setHeader(d.header)
        if (d.items) setItems(d.items)
        if (d.discount !== undefined) setDiscount(d.discount)
        if (d.discountType) setDiscountType(d.discountType)
        if (d.tax !== undefined) setTax(d.tax)
        if (d.taxType) setTaxType(d.taxType)
        if (d.payment !== undefined) setPayment(d.payment)
        if (d.paymentMethod) setPaymentMethod(d.paymentMethod)
        if (d.settings) setSettings(p => ({ ...p, ...d.settings }))
        msg('Data di-import')
      } catch { msg('File tidak valid', 'error') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // Generate barcode SVG untuk print
  const genBarcodeSVG = (w) => {
    if (!settings.showBarcode || !header.receiptNumber) return ''
    try {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      JsBarcode(svg, header.receiptNumber, {
        format: "CODE128", width: 2, height: 50,
        displayValue: false, background: "#ffffff",
        lineColor: settings.fontColor === '#000000' ? '#000000' : settings.fontColor,
        margin: 0,
      })
      let str = new XMLSerializer().serializeToString(svg)
      str = str.replace(/width="[^"]*"/, `width="${w}"`)
      str = str.replace(/height="[^"]*"/, 'height="50"')
      str = str.replace(/viewBox="[^"]*"/, `viewBox="0 0 ${w} 50"`)
      return str
    } catch { return '' }
  }

  // Generate HTML struk untuk print
  const genPrintHTML = () => {
    const fs = settings.fontSize
    const cp = settings.charPerLine
    const color = settings.fontColor
    const font = settings.fontFamily
    const w = settings.paperSize === 58 ? 280 : 420
    const bw = settings.paperSize === 58 ? 200 : 300
    const bc = getBorderChar()
    const sep = bc.repeat(cp)
    const thinSep = '-'.repeat(cp)

    const dots = (a, b) => `${a} ${'.'.repeat(Math.max(1, cp - String(a).length - String(b).length - 1))} ${b}`

    let h = `<div style="width:${w}px;padding:24px 20px;background:#fff;color:${color};font-family:${font};font-size:${fs}px;line-height:1.5;margin:auto;">`

    // Header Toko
    h += `<div style="text-align:${settings.align};text-transform:uppercase;">`
    if (settings.showLogo && settings.logoText) {
      h += `<div style="font-size:${fs*2.5}px;font-weight:bold;letter-spacing:3px;margin-bottom:4px;">${settings.logoText}</div>`
    }
    h += `<div style="font-size:${fs*2}px;font-weight:bold;letter-spacing:2px;">${header.storeName}</div>`
    h += `<div style="font-size:${fs}px;">${header.storeAddress.replace(/\n/g, '<br>')}</div>`
    if (header.storePhone) h += `<div>Telp: ${header.storePhone}</div>`
    if (header.storePhone2) h += `<div>HP: ${header.storePhone2}</div>`
    if (header.storeEmail) h += `<div>Email: ${header.storeEmail}</div>`
    if (header.storeWebsite) h += `<div>Web: ${header.storeWebsite}</div>`
    h += `</div>`

    h += `<div style="margin:6px 0;letter-spacing:2px;text-align:center;">${sep}</div>`

    // Judul Struk
    if (header.receiptTitle) {
      h += `<div style="text-align:center;font-size:${fs*1.4}px;font-weight:bold;margin:4px 0;">${header.receiptTitle}</div>`
      h += `<div style="margin:2px 0;letter-spacing:2px;text-align:center;">${thinSep}</div>`
    }

    // Info Transaksi
    h += `<div style="font-size:${fs}px;">`
    if (header.receiptNumber) h += dots('No', header.receiptNumber) + '<br>'
    if (header.date) {
      const d = new Date(header.date)
      const ds = d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      const ts = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      h += dots('Tgl', ds) + '<br>'
      h += dots('Jam', ts) + '<br>'
    }
    if (header.cashier && settings.showCashier) h += dots('Kasir', header.cashier) + '<br>'
    if (header.customer && settings.showCustomer) {
      h += dots('Cust', header.customer) + '<br>'
      if (header.customerAddress) h += dots('Almt', header.customerAddress) + '<br>'
      if (header.customerPhone) h += dots('HP', header.customerPhone) + '<br>'
    }
    if (header.note) h += '<br><i>' + header.note.replace(/\n/g, '<br>') + '</i><br>'
    h += `</div>`

    h += `<div style="margin:6px 0;letter-spacing:2px;text-align:center;">${sep}</div>`

    // Header Barang
    h += `<div style="display:flex;font-weight:bold;border-bottom:2px solid ${color};padding:4px 0;margin-bottom:2px;">`
    h += `<span style="flex:1;">Barang</span>`
    h += `<span style="width:32px;text-align:center;">Qty</span>`
    h += `<span style="width:65px;text-align:right;">Harga</span>`
    h += `<span style="width:75px;text-align:right;">Sub</span>`
    h += `</div>`

    // Items
    items.forEach(item => {
      if (!item.name) return
      const sub = item.qty * item.price
      h += `<div style="border-bottom:1px dashed #ddd;padding:3px 0;">`
      h += `<div style="display:flex;">`
      h += `<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.name}</span>`
      h += `<span style="width:32px;text-align:center;">${item.qty}</span>`
      h += `<span style="width:65px;text-align:right;">${fmt(item.price)}</span>`
      h += `<span style="width:75px;text-align:right;">${fmt(sub)}</span>`
      h += `</div>`
      if (item.unit) h += `<div style="color:#888;font-size:${fs-1}px;">&nbsp;&nbsp;(${item.unit})</div>`
      h += `</div>`
    })

    h += `<div style="margin:6px 0;letter-spacing:2px;text-align:center;">${thinSep}</div>`

    // Total
    h += `<div style="display:flex;justify-content:space-between;padding:2px 0;"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>`
    if (discVal > 0) {
      const label = discountType === 'percent' ? `Diskon (${discount}%)` : 'Diskon'
      h += `<div style="display:flex;justify-content:space-between;color:#c0392b;padding:2px 0;"><span>${label}</span><span>-${fmt(discVal)}</span></div>`
    }
    if (taxVal > 0) {
      const label = taxType === 'percent' ? `Pajak (${tax}%)` : 'Pajak'
      h += `<div style="display:flex;justify-content:space-between;padding:2px 0;"><span>${label}</span><span>${fmt(taxVal)}</span></div>`
    }

    h += `<div style="margin:4px 0;letter-spacing:2px;text-align:center;">${sep}</div>`

    // Grand Total
    h += `<div style="display:flex;justify-content:space-between;font-size:${fs*1.6}px;font-weight:bold;padding:4px 0;">`
    h += `<span>TOTAL</span><span>${fmt(total)}</span></div>`

    h += `<div style="margin:4px 0;letter-spacing:2px;text-align:center;">${thinSep}</div>`

    // Pembayaran
    if (payment > 0) {
      h += `<div style="display:flex;justify-content:space-between;padding:2px 0;"><span>Total Bayar</span><span>${fmt(total)}</span></div>`
      if (settings.showPaymentMethod) h += `<div style="display:flex;justify-content:space-between;padding:2px 0;"><span>Metode</span><span>${paymentMethod}</span></div>`
      h += `<div style="display:flex;justify-content:space-between;padding:2px 0;"><span>Bayar</span><span>${fmt(payment)}</span></div>`
      if (settings.showChange) {
        h += `<div style="display:flex;justify-content:space-between;padding:2px 0;font-weight:bold;"><span>Kembali</span><span>${fmt(change)}</span></div>`
      }
      h += `<div style="margin:4px 0;letter-spacing:2px;text-align:center;">${thinSep}</div>`
    }

    // Barcode CODE128
    if (settings.showBarcode && header.receiptNumber) {
      const svg = genBarcodeSVG(bw)
      if (svg) {
        h += `<div style="text-align:center;margin:12px 0 6px;">${svg}`
        h += `<div style="font-size:${fs+1}px;letter-spacing:4px;margin-top:4px;font-weight:bold;">${header.receiptNumber}</div></div>`
        h += `<div style="margin:4px 0;letter-spacing:2px;text-align:center;">${thinSep}</div>`
      }
    }

    // Footer
    if (header.footer) {
      h += `<div style="text-align:center;font-size:${fs}px;line-height:1.6;">${header.footer.replace(/\n/g, '<br>')}</div>`
    }

    // Terima Kasih
    if (settings.showThankYou) {
      h += `<div style="text-align:center;margin-top:10px;font-size:${fs*1.2}px;font-weight:bold;letter-spacing:2px;">*** TERIMA KASIH ***</div>`
      h += `<div style="text-align:center;font-size:${fs-1}px;color:#888;">~ Selamat Belanja Kembali ~</div>`
    }

    h += `</div>`
    return h
  }

  const handlePrint = () => {
    const pw = window.open('', '_blank')
    if (!pw) { msg('Izinkan popup!', 'error'); return }
    pw.document.write(`<!DOCTYPE html><html><head><title>Cetak Struk - ${header.storeName}</title>
      <style>@page{margin:0}body{margin:0;padding:0;display:flex;justify-content:center;background:#f0f0f0}@media print{body{background:#fff}}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inconsolata&family=VT323&family=Space+Mono&family=Share+Tech+Mono&family=Courier+Prime&display=swap" rel="stylesheet">
      </head><body>${genPrintHTML()}<script>window.onload=function(){window.print();window.close()}</script></body></html>`)
    pw.document.close()
  }

  // Bluetooth
  const connectBT = async () => {
    if (!navigator.bluetooth) { msg('Web Bluetooth hanya di Chrome/Edge Android', 'error'); return }
    try {
      const d = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] })
      setDevice(d); setConnected(true)
      msg(`Terhubung ke ${d.name || 'Printer'}`)
    } catch (e) { if (e.name !== 'NotFoundError') msg('Gagal: ' + e.message, 'error') }
  }

  const disconnectBT = () => {
    if (device && device.gatt) device.gatt.disconnect()
    setDevice(null); setConnected(false); msg('Bluetooth terputus', 'info')
  }

  const printBT = async () => {
    if (!connected) { msg('Belum terhubung', 'error'); return }
    try {
      const server = await device.gatt.connect()
      const svc = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb')
      const char = await svc.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb')
      await char.writeValue(generateESCPOS())
      msg('Cetak Bluetooth berhasil!')
    } catch (e) { msg('Gagal cetak: ' + e.message, 'error') }
  }

  const generateESCPOS = () => {
    const enc = new TextEncoder()
    const p = []
    const bc = getBorderChar()
    const sep = bc.repeat(settings.charPerLine)

    p.push(0x1B, 0x40)
    p.push(0x1B, 0x61, 0x01)
    p.push(0x1B, 0x45, 0x01)
    p.push(0x1D, 0x21, 0x11)
    p.push(...enc.encode(header.storeName + '\n'))
    p.push(0x1B, 0x45, 0x00, 0x1D, 0x21, 0x00)
    p.push(...enc.encode(header.storeAddress + '\n'))
    if (header.storePhone) p.push(...enc.encode('Telp: ' + header.storePhone + '\n'))
    if (header.storePhone2) p.push(...enc.encode('HP: ' + header.storePhone2 + '\n'))
    if (header.storeEmail) p.push(...enc.encode('Email: ' + header.storeEmail + '\n'))
    p.push(...enc.encode('\n' + sep + '\n\n'))
    if (header.receiptTitle) p.push(...enc.encode(header.receiptTitle + '\n'))
    p.push(0x1B, 0x61, 0x00)
    if (header.receiptNumber) p.push(...enc.encode('No\t: ' + header.receiptNumber + '\n'))
    if (header.date) {
      const d = new Date(header.date)
      p.push(...enc.encode('Tgl\t: ' + d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '\n'))
      p.push(...enc.encode('Jam\t: ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + '\n'))
    }
    if (header.cashier && settings.showCashier) p.push(...enc.encode('Kasir\t: ' + header.cashier + '\n'))
    if (header.customer && settings.showCustomer) {
      p.push(...enc.encode('Cust\t: ' + header.customer + '\n'))
      if (header.customerAddress) p.push(...enc.encode('Almt\t: ' + header.customerAddress + '\n'))
      if (header.customerPhone) p.push(...enc.encode('HP\t: ' + header.customerPhone + '\n'))
    }
    p.push(...enc.encode('\n' + sep + '\n'))
    p.push(...enc.encode(`\n${'Barang'.padEnd(10)} ${'Qty'.padStart(4)}  ${'Harga'.padStart(8)}  ${'Sub'.padStart(10)}\n${sep}\n`))
    items.forEach(item => {
      if (!item.name) return
      const sub = item.qty * item.price
      p.push(...enc.encode(`${item.name.padEnd(10)} ${String(item.qty).padStart(4)}  ${fmt(item.price).padStart(8)}  ${fmt(sub).padStart(10)}\n`))
      if (item.unit) p.push(...enc.encode(` (${item.unit})\n`))
    })
    p.push(...enc.encode('\n' + '-'.repeat(settings.charPerLine) + '\n'))
    const tw = settings.charPerLine - 10
    p.push(...enc.encode(`Subtotal${' '.repeat(tw-8)}${fmt(subtotal).padStart(10)}\n`))
    if (discVal > 0) {
      const l = discountType === 'percent' ? `Diskon(${discount}%)` : 'Diskon'
      p.push(...enc.encode(`${l}${' '.repeat(tw-l.length)}-${fmt(discVal).padStart(9)}\n`))
    }
    if (taxVal > 0) {
      const l = taxType === 'percent' ? `Pajak(${tax}%)` : 'Pajak'
      p.push(...enc.encode(`${l}${' '.repeat(tw-l.length)}${fmt(taxVal).padStart(10)}\n`))
    }
    p.push(...enc.encode(sep + '\n'))
    p.push(0x1B, 0x45, 0x01)
    p.push(...enc.encode(`TOTAL${' '.repeat(tw-5)}${fmt(total).padStart(10)}\n`))
    p.push(0x1B, 0x45, 0x00)
    if (payment > 0) {
      p.push(...enc.encode(`Bayar${' '.repeat(tw-5)}${fmt(payment).padStart(10)}\n`))
      p.push(...enc.encode(`Kembali${' '.repeat(tw-7)}${fmt(change).padStart(10)}\n`))
    }
    if (settings.showBarcode && header.receiptNumber) {
      p.push(0x1D, 0x6B, 0x02)
      p.push(...enc.encode(header.receiptNumber + '\x00'))
    }
    if (header.footer) {
      p.push(0x1B, 0x61, 0x01)
      p.push(...enc.encode('\n' + sep + '\n' + header.footer + '\n\n*** TERIMA KASIH ***\n\n'))
    }
    p.push(0x1D, 0x56, 0x00)
    return new Uint8Array(p)
  }

  return (
    <div className="app">
      {/* HEADER */}
      <header className="app-header">
        <div className="h-top">
          <div className="h-logo">
            <div className="h-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="18" rx="2"/><path d="M6 7h12"/><path d="M6 11h12"/><path d="M6 15h8"/>
              </svg>
            </div>
            <div>
              <h1>Receipt Generator</h1>
              <span className="h-sub">Cetak Struk Online</span>
            </div>
          </div>
          <div className="h-btns">
            <button className="btn-ico" onClick={() => setShowSettings(!showSettings)} title="Pengaturan">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
            <button className="btn-ico" onClick={() => setShowReset(true)} title="Reset">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="tabs">
          <button className={`tab ${tab === 'input' ? 'on' : ''}`} onClick={() => setTab('input')}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Input Data
          </button>
          <button className={`tab ${tab === 'preview' ? 'on' : ''}`} onClick={() => setTab('preview')}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            Preview & Cetak
          </button>
        </div>
      </header>

      <main>
        {/* ==================== TAB INPUT ==================== */}
        {tab === 'input' && (
          <div className="tab-in">
            {/* HEADER TOKO */}
            <section className="card">
              <div className="card-h"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h5"/><path d="M8 18h2"/></svg><h3>Informasi Toko</h3></div>
              <div className="grid-2">
                <div className="fg"><label>Nama Toko / Usaha <span className="req">*</span></label><input value={header.storeName} onChange={e => setHeader({...header, storeName: e.target.value})} placeholder="Nama Toko" /></div>
                <div className="fg"><label>Judul Struk</label><input value={header.receiptTitle} onChange={e => setHeader({...header, receiptTitle: e.target.value})} placeholder="STRUK BELANJA / INVOICE" /></div>
                <div className="fg"><label>Nomor Struk <span className="req">*</span></label><input value={header.receiptNumber} onChange={e => setHeader({...header, receiptNumber: e.target.value})} placeholder="INV-001" /></div>
                <div className="fg"><label>Tanggal & Waktu</label><input type="datetime-local" value={header.date} onChange={e => setHeader({...header, date: e.target.value})} /></div>
                <div className="fg full"><label>Alamat Toko</label><textarea rows="3" value={header.storeAddress} onChange={e => setHeader({...header, storeAddress: e.target.value})} placeholder="Alamat lengkap" /></div>
                <div className="fg"><label>No. Telepon 1</label><input value={header.storePhone} onChange={e => setHeader({...header, storePhone: e.target.value})} placeholder="(021) 1234-5678" /></div>
                <div className="fg"><label>No. Telepon 2 (HP)</label><input value={header.storePhone2} onChange={e => setHeader({...header, storePhone2: e.target.value})} placeholder="0812-3456-7890" /></div>
                <div className="fg"><label>Email</label><input value={header.storeEmail} onChange={e => setHeader({...header, storeEmail: e.target.value})} placeholder="email@toko.com" /></div>
                <div className="fg"><label>Website</label><input value={header.storeWebsite} onChange={e => setHeader({...header, storeWebsite: e.target.value})} placeholder="www.tokoanda.com" /></div>
              </div>
            </section>

            {/* INFO KASIR & PELANGGAN */}
            <section className="card">
              <div className="card-h"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><h3>Kasir & Pelanggan</h3></div>
              <div className="grid-2">
                <div className="fg"><label>Nama Kasir</label><input value={header.cashier} onChange={e => setHeader({...header, cashier: e.target.value})} placeholder="Nama Kasir" /></div>
                <div className="fg"><label>Nama Pelanggan</label><input value={header.customer} onChange={e => setHeader({...header, customer: e.target.value})} placeholder="Nama Pelanggan (opsional)" /></div>
                <div className="fg full"><label>Alamat Pelanggan</label><textarea rows="2" value={header.customerAddress} onChange={e => setHeader({...header, customerAddress: e.target.value})} placeholder="Alamat pelanggan (opsional)" /></div>
                <div className="fg"><label>No. HP Pelanggan</label><input value={header.customerPhone} onChange={e => setHeader({...header, customerPhone: e.target.value})} placeholder="No. HP pelanggan" /></div>
                <div className="fg full"><label>Catatan / Note</label><textarea rows="2" value={header.note} onChange={e => setHeader({...header, note: e.target.value})} placeholder="Catatan tambahan (opsional)" /></div>
              </div>
            </section>

            {/* ITEMS */}
            <section className="card">
              <div className="card-h">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                <h3>Daftar Barang</h3>
                <span className="badge">{items.length} item</span>
              </div>
              {items.map((item, idx) => (
                <div className="item-row" key={item.id}>
                  <div className="item-num">{idx + 1}</div>
                  <div className="item-body">
                    <div className="fg"><label>Nama Barang <span className="req">*</span></label><input value={item.name} onChange={e => updItem(item.id, 'name', e.target.value)} placeholder="Nama barang" /></div>
                    <div className="item-detail">
                      <div className="fg"><label>Jumlah</label><input type="number" min="0" value={item.qty} onChange={e => updItem(item.id, 'qty', Math.max(0, Number(e.target.value)))} /></div>
                      <div className="fg"><label>Satuan</label><select value={item.unit} onChange={e => updItem(item.id, 'unit', e.target.value)}>{UNITS.map(u => <option key={u}>{u}</option>)}</select></div>
                      <div className="fg"><label>Harga Satuan</label><input type="number" min="0" value={item.price} onChange={e => updItem(item.id, 'price', Math.max(0, Number(e.target.value)))} placeholder="0" /></div>
                    </div>
                    <div className="item-sub">Subtotal: <b>{fmt(item.qty * item.price)}</b></div>
                  </div>
                  <button className="btn-del" onClick={() => delItem(item.id)} disabled={items.length <= 1}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
              <button className="btn-add" onClick={addItem}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambah Barang
              </button>
            </section>

            {/* DISKON & PAJAK */}
            <section className="card">
              <div className="card-h"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg><h3>Diskon & Pajak</h3></div>
              <div className="grid-2">
                <div className="fg">
                  <label>Diskon</label>
                  <div className="input-grp">
                    <input type="number" min="0" value={discount} onChange={e => setDiscount(Math.max(0, Number(e.target.value)))} placeholder="0" />
                    <select value={discountType} onChange={e => setDiscountType(e.target.value)}>
                      <option value="nominal">Rp</option><option value="percent">%</option>
                    </select>
                  </div>
                </div>
                <div className="fg">
                  <label>Pajak</label>
                  <div className="input-grp">
                    <input type="number" min="0" value={tax} onChange={e => setTax(Math.max(0, Number(e.target.value)))} placeholder="0" />
                    <select value={taxType} onChange={e => setTaxType(e.target.value)}>
                      <option value="percent">%</option><option value="nominal">Rp</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* PEMBAYARAN */}
            <section className="card">
              <div className="card-h"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg><h3>Pembayaran</h3></div>
              <div className="grid-2">
                <div className="fg">
                  <label>Metode Pembayaran</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Jumlah Dibayar</label>
                  <input type="number" min="0" value={payment} onChange={e => setPayment(Math.max(0, Number(e.target.value)))} placeholder="0" />
                </div>
              </div>
              {payment > 0 && (
                <div className="pay-summary">
                  <span>Total: <b>{fmt(total)}</b></span>
                  <span>Bayar: <b>{fmt(payment)}</b></span>
                  <span className={change < 0 ? 'red' : ''}>Kembali: <b>{fmt(change)}</b></span>
                  <span>Metode: <b>{paymentMethod}</b></span>
                </div>
              )}
            </section>

            {/* FOOTER */}
            <section className="card">
              <div className="card-h"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M3 15h18"/><path d="M3 19h18"/><path d="M3 11h18"/><path d="M3 7h18"/></svg><h3>Footer Struk</h3></div>
              <div className="fg full">
                <label>Pesan Bawah / Footer</label>
                <textarea rows="4" value={header.footer} onChange={e => setHeader({...header, footer: e.target.value})} placeholder="Terima kasih telah berbelanja..." />
                <span className="hint">Gunakan Enter untuk baris baru</span>
              </div>
            </section>

            {/* TOMBOL SIMPAN */}
            <button className="btn-save" onClick={saveReceipt}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Simpan ke Riwayat Struk
            </button>
          </div>
        )}

        {/* ==================== TAB PREVIEW ==================== */}
        {tab === 'preview' && (
          <div className="tab-prev">
            <div className="prev-ctrl">
              <div className="prev-btns">
                <button className="btn-pri" onClick={handlePrint}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  🖨️ Cetak Printer
                </button>
                {connected ? (
                  <button className="btn-bt connected" onClick={printBT}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 7 18 13 12 17 12 1 18 5 6 11"/>
                    </svg>
                    📡 Cetak Bluetooth
                  </button>
                ) : (
                  <button className="btn-bt" onClick={connectBT}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 7 18 13 12 17 12 1 18 5 6 11"/>
                    </svg>
                    🔗 Hubungkan Bluetooth
                  </button>
                )}
                {connected && <button className="btn-sec" onClick={disconnectBT}>✖ Putuskan</button>}
                <button className="btn-sec" onClick={() => { setTab('input'); setShowSettings(true) }}>
                  ⚙️ Pengaturan
                </button>
              </div>
              <div className="prev-info">
                <span>📄 {settings.paperSize}mm</span>
                <span>✏️ {settings.fontFamily.split(',')[0].replace(/'/g, '')}</span>
                <span>📏 {settings.fontSize}px</span>
                <span>💰 {fmt(total)}</span>
                <span>📦 {items.length} item</span>
                {settings.showBarcode ? <span>🔲 Barcode ON</span> : <span>🔳 Barcode OFF</span>}
              </div>
            </div>

            {/* STRUK PREVIEW */}
            <div className="prev-wrap">
              <div className="struk" style={{
                width: settings.paperSize === 58 ? '280px' : '420px',
                fontFamily: settings.fontFamily,
                color: settings.fontColor,
                fontSize: settings.fontSize + 'px',
              }}>
                {/* HEADER TOKO */}
                <div className="s-header" style={{ textAlign: settings.align }}>
                  {settings.showLogo && settings.logoText && (
                    <div className="s-logo">{settings.logoText}</div>
                  )}
                  <div className="s-namatoko">{header.storeName || 'TOKO ANDA'}</div>
                  <div className="s-alamat">{header.storeAddress}</div>
                  {header.storePhone && <div>Telp: {header.storePhone}</div>}
                  {header.storePhone2 && <div>HP: {header.storePhone2}</div>}
                  {header.storeEmail && <div>Email: {header.storeEmail}</div>}
                  {header.storeWebsite && <div>Web: {header.storeWebsite}</div>}
                </div>

                <div className="s-sep">{getBorderChar().repeat(settings.charPerLine)}</div>

                {/* JUDUL */}
                {header.receiptTitle && <div className="s-judul">{header.receiptTitle}</div>}

                {/* INFO TRANSAKSI */}
                <div className="s-info">
                  {header.receiptNumber && (
                    <div className="s-dotrow"><span className="s-lb">No</span><span className="s-dots">{'.'.repeat(Math.max(2, settings.charPerLine - 3 - header.receiptNumber.length))}</span><span className="s-val">{header.receiptNumber}</span></div>
                  )}
                  {header.date && (() => {
                    const d = new Date(header.date)
                    const dateStr = d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                    const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                    return (
                      <>
                        <div className="s-dotrow"><span className="s-lb">Tgl</span><span className="s-dots">{'.'.repeat(Math.max(2, settings.charPerLine - 3 - dateStr.length))}</span><span className="s-val">{dateStr}</span></div>
                        <div className="s-dotrow"><span className="s-lb">Jam</span><span className="s-dots">{'.'.repeat(Math.max(2, settings.charPerLine - 3 - timeStr.length))}</span><span className="s-val">{timeStr}</span></div>
                      </>
                    )
                  })()}
                  {header.cashier && settings.showCashier && (
                    <div className="s-dotrow"><span className="s-lb">Kasir</span><span className="s-dots">{'.'.repeat(Math.max(2, settings.charPerLine - 6 - header.cashier.length))}</span><span className="s-val">{header.cashier}</span></div>
                  )}
                  {header.customer && settings.showCustomer && (
                    <div className="s-dotrow"><span className="s-lb">Cust</span><span className="s-dots">{'.'.repeat(Math.max(2, settings.charPerLine - 5 - header.customer.length))}</span><span className="s-val">{header.customer}</span></div>
                  )}
                  {header.customerAddress && settings.showCustomer && (
                    <div className="s-dotrow"><span className="s-lb">Almt</span><span className="s-dots">{'.'.repeat(Math.max(2, settings.charPerLine - 5 - header.customerAddress.length))}</span><span className="s-val">{header.customerAddress}</span></div>
                  )}
                  {header.customerPhone && settings.showCustomer && (
                    <div className="s-dotrow"><span className="s-lb">HP</span><span className="s-dots">{'.'.repeat(Math.max(2, settings.charPerLine - 3 - header.customerPhone.length))}</span><span className="s-val">{header.customerPhone}</span></div>
                  )}
                  {header.note && (
                    <div className="s-note"><i>{header.note.split('\n').map((l, i) => <div key={i}>{l}</div>)}</i></div>
                  )}
                </div>

                <div className="s-sep">{getBorderChar().repeat(settings.charPerLine)}</div>

                {/* HEADER ITEMS */}
                <div className="s-items-h">
                  <span className="s-cn">Barang</span>
                  <span className="s-cq">Qty</span>
                  <span className="s-ch">Harga</span>
                  <span className="s-cs">Sub</span>
                </div>

                {/* ITEMS */}
                {items.map((item, i) => (
                  <div className="s-item" key={i}>
                    {item.name ? (
                      <>
                        <div className="s-item-r">
                          <span className="s-cn">{item.name}</span>
                          <span className="s-cq">{item.qty}</span>
                          <span className="s-ch">{fmt(item.price)}</span>
                          <span className="s-cs">{fmt(item.qty * item.price)}</span>
                        </div>
                        <div className="s-unit">({item.unit})</div>
                      </>
                    ) : (
                      <div className="s-empty">(kosong)</div>
                    )}
                  </div>
                ))}

                <div className="s-sep-thin">{'-'.repeat(settings.charPerLine)}</div>

                {/* TOTAL */}
                <div className="s-total-r"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                {discVal > 0 && <div className="s-total-r merah"><span>{discountType === 'percent' ? `Diskon (${discount}%)` : 'Diskon'}</span><span className="s-minus">-{fmt(discVal)}</span></div>}
                {taxVal > 0 && <div className="s-total-r"><span>{taxType === 'percent' ? `Pajak (${tax}%)` : 'Pajak'}</span><span>{fmt(taxVal)}</span></div>}

                <div className="s-sep">{getBorderChar().repeat(settings.charPerLine)}</div>

                <div className="s-grand">
                  <span>TOTAL</span>
                  <span>{fmt(total)}</span>
                </div>

                <div className="s-sep-thin">{'-'.repeat(settings.charPerLine)}</div>

                {/* PEMBAYARAN */}
                {payment > 0 && (
                  <>
                    <div className="s-total-r"><span>Total Bayar</span><span>{fmt(total)}</span></div>
                    {settings.showPaymentMethod && <div className="s-total-r"><span>Metode</span><span>{paymentMethod}</span></div>}
                    <div className="s-total-r"><span>Bayar</span><span>{fmt(payment)}</span></div>
                    {settings.showChange && <div className="s-total-r bold"><span>Kembali</span><span>{fmt(change)}</span></div>}
                    <div className="s-sep-thin">{'-'.repeat(settings.charPerLine)}</div>
                  </>
                )}

                {/* BARCODE CODE128 */}
                {settings.showBarcode && header.receiptNumber && (
                  <div className="s-barcode">
                    <svg ref={barcodeRef} className="s-bcode" style={{ color: settings.fontColor }}></svg>
                    <div className="s-btext">{header.receiptNumber}</div>
                  </div>
                )}

                {/* FOOTER */}
                {header.footer && (
                  <div className="s-footer">
                    <div className="s-sep">{getBorderChar().repeat(settings.charPerLine)}</div>
                    <div style={{ textAlign: 'center', lineHeight: '1.6' }}>
                      {header.footer.split('\n').map((l, i) => <div key={i}>{l || '\u00A0'.repeat(settings.charPerLine)}</div>)}
                    </div>
                  </div>
                )}

                {/* TERIMA KASIH */}
                {settings.showThankYou && (
                  <>
                    <div className="s-end">*** TERIMA KASIH ***</div>
                    <div className="s-end-sub">~ Selamat Belanja Kembali ~</div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SETTINGS PANEL ==================== */}
        {showSettings && (
          <div className="settings">
            <div className="card">
              <div className="card-h"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><h3>Pengaturan Tampilan Struk</h3></div>
              <div className="grid-2">
                <div className="fg">
                  <label>Ukuran Kertas</label>
                  <select value={settings.paperSize} onChange={e => setSettings({...settings, paperSize: Number(e.target.value)})}>
                    <option value={58}>58 mm (Struk Kecil)</option>
                    <option value={80}>80 mm (Struk Besar)</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Jenis Font</label>
                  <select value={settings.fontFamily} onChange={e => setSettings({...settings, fontFamily: e.target.value})}>
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Ukuran Font</label>
                  <select value={settings.fontSize} onChange={e => setSettings({...settings, fontSize: Number(e.target.value)})}>
                    {FONT_SIZES.map(s => <option key={s} value={s}>{s} px</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Warna Font</label>
                  <div className="color-row">
                    <input type="color" value={settings.fontColor} onChange={e => setSettings({...settings, fontColor: e.target.value})} />
                    {COLORS.map(c => (
                      <button key={c.value} className={`cd ${settings.fontColor === c.value ? 'on' : ''}`} style={{ background: c.value }} onClick={() => setSettings({...settings, fontColor: c.value})} title={c.name} />
                    ))}
                  </div>
                </div>
                <div className="fg">
                  <label>Rata Teks Header</label>
                  <select value={settings.align} onChange={e => setSettings({...settings, align: e.target.value})}>
                    {ALIGN_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.name}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Karakter per Baris</label>
                  <select value={settings.charPerLine} onChange={e => setSettings({...settings, charPerLine: Number(e.target.value)})}>
                    {CHAR_PER_LINE_OPTIONS.map(c => <option key={c} value={c}>{c} karakter</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Garis Pemisah</label>
                  <select value={settings.borderStyle} onChange={e => setSettings({...settings, borderStyle: e.target.value})}>
                    <option value="equals">===== (Sama Dengan)</option>
                    <option value="dashes">----- (Strip)</option>
                    <option value="stars">***** (Bintang)</option>
                  </select>
                </div>
                <div className="fg">
                  <label className="cb">
                    <input type="checkbox" checked={settings.showBarcode} onChange={e => setSettings({...settings, showBarcode: e.target.checked})} />
                    <span className="cb-box"></span>
                    Tampilkan Barcode (CODE128)
                  </label>
                  <span className="hint">Generate otomatis dari nomor struk</span>
                </div>
                <div className="fg">
                  <label className="cb">
                    <input type="checkbox" checked={settings.showCustomer} onChange={e => setSettings({...settings, showCustomer: e.target.checked})} />
                    <span className="cb-box"></span>
                    Tampilkan Info Pelanggan
                  </label>
                </div>
                <div className="fg">
                  <label className="cb">
                    <input type="checkbox" checked={settings.showCashier} onChange={e => setSettings({...settings, showCashier: e.target.checked})} />
                    <span className="cb-box"></span>
                    Tampilkan Nama Kasir
                  </label>
                </div>
                <div className="fg">
                  <label className="cb">
                    <input type="checkbox" checked={settings.showPaymentMethod} onChange={e => setSettings({...settings, showPaymentMethod: e.target.checked})} />
                    <span className="cb-box"></span>
                    Tampilkan Metode Bayar
                  </label>
                </div>
                <div className="fg">
                  <label className="cb">
                    <input type="checkbox" checked={settings.showChange} onChange={e => setSettings({...settings, showChange: e.target.checked})} />
                    <span className="cb-box"></span>
                    Tampilkan Kembalian
                  </label>
                </div>
                <div className="fg">
                  <label className="cb">
                    <input type="checkbox" checked={settings.showThankYou} onChange={e => setSettings({...settings, showThankYou: e.target.checked})} />
                    <span className="cb-box"></span>
                    Tampilkan "Terima Kasih"
                  </label>
                </div>
                <div className="fg">
                  <label className="cb">
                    <input type="checkbox" checked={settings.showLogo} onChange={e => setSettings({...settings, showLogo: e.target.checked})} />
                    <span className="cb-box"></span>
                    Tampilkan Logo Teks
                  </label>
                </div>
                {settings.showLogo && (
                  <div className="fg">
                    <label>Teks Logo</label>
                    <input value={settings.logoText} onChange={e => setSettings({...settings, logoText: e.target.value})} placeholder="Contoh: TOKO ANDA" />
                  </div>
                )}
              </div>
            </div>

            {/* EXPORT/IMPORT */}
            <div className="card">
              <div className="card-h"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><h3>Export / Import Data</h3></div>
              <div className="data-act">
                <button className="btn-sec" onClick={exportData}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export JSON
                </button>
                <label className="btn-sec file-lb">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Import JSON
                  <input type="file" accept=".json" onChange={importData} hidden />
                </label>
              </div>
            </div>

            {/* RIWAYAT STRUK */}
            {receiptList.length > 0 && (
              <div className="card">
                <div className="card-h"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><h3>Riwayat Struk Tersimpan</h3><span className="badge">{receiptList.length}</span></div>
                <div className="history-list">
                  {receiptList.map((r, i) => (
                    <div className="history-item" key={i}>
                      <span><b>{r.header.receiptNumber}</b> - {r.header.storeName}</span>
                      <span>{fmt(r.total)}</span>
                      <span className="h-date">{new Date(r.date).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* NOTIF */}
      {notif && <div className={`notif ${notif.type}`}>{notif.text}</div>}

      {/* MODAL RESET */}
      {showReset && (
        <div className="modal-bg" onClick={() => setShowReset(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#fdcb6e" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3>Reset Semua Data?</h3>
            <p>Semua data input akan dihapus dan kembali ke pengaturan awal.</p>
            <div className="modal-act">
              <button className="btn-sec" onClick={() => setShowReset(false)}>Batal</button>
              <button className="btn-dgr" onClick={resetAll}>Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App