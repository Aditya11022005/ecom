"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const OWNER_WHATSAPP = '919561680380' // +91 country code prefixed, no plus sign

const AppointmentClient = () => {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name"
    if (!form.phone.trim()) return "Please enter your phone number"
    if (!form.date) return "Please choose a preferred date"
    if (!form.time) return "Please choose a preferred time"
    return null
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const err = validate()
    if (err) return alert(err)
    setSubmitting(true)

    const parts = [
      `*New Appointment Request*`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
    ]
    if (form.email) parts.push(`Email: ${form.email}`)
    parts.push(`Preferred Date: ${form.date}`)
    parts.push(`Preferred Time: ${form.time}`)
    if (form.message) parts.push(`Message: ${form.message}`)

    const text = encodeURIComponent(parts.join("\n"))
    // Open WhatsApp chat with prefilled message
    const waUrl = `https://wa.me/${OWNER_WHATSAPP}?text=${text}`
    // Open in new tab
    window.open(waUrl, '_blank')

    setSubmitting(false)
    // Optionally navigate to a thank you page or show a success message
    router.push('/')
  }

  return (
    <div className='min-h-[70vh] flex items-center justify-center py-12 px-4'>
      <div className='max-w-2xl w-full bg-white rounded shadow p-8'>
        <h2 className='text-2xl font-semibold mb-4'>Book an Appointment</h2>
        <p className='text-sm text-gray-600 mb-6'>Please provide your preferred date and time. We'll contact you on WhatsApp to confirm the appointment.</p>

        <form onSubmit={onSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>Full name</label>
            <input name='name' value={form.name} onChange={onChange} className='mt-1 block w-full border rounded px-3 py-2' />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>Phone number</label>
            <input name='phone' value={form.phone} onChange={onChange} className='mt-1 block w-full border rounded px-3 py-2' placeholder='e.g. 9876543210' />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>Email (optional)</label>
            <input name='email' value={form.email} onChange={onChange} className='mt-1 block w-full border rounded px-3 py-2' />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Preferred date</label>
              <input type='date' name='date' value={form.date} onChange={onChange} className='mt-1 block w-full border rounded px-3 py-2' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Preferred time</label>
              <input type='time' name='time' value={form.time} onChange={onChange} className='mt-1 block w-full border rounded px-3 py-2' />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>Message (optional)</label>
            <textarea name='message' value={form.message} onChange={onChange} rows={4} className='mt-1 block w-full border rounded px-3 py-2' />
          </div>

          <div className='flex items-center justify-end gap-3'>
            <button type='button' onClick={() => router.back()} className='px-4 py-2 border rounded'>Cancel</button>
            <button type='submit' className='px-4 py-2 bg-primary text-white rounded' disabled={submitting}>{submitting ? 'Sending...' : 'Send via WhatsApp'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AppointmentClient
