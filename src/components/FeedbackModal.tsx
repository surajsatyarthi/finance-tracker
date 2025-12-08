
'use client'

import { Fragment, useState, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperClipIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface FeedbackModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const [message, setMessage] = useState('')
    const [files, setFiles] = useState<File[]>([])
    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim() && files.length === 0) return

        setSending(true)

        try {
            const formData = new FormData()
            formData.append('message', message)
            formData.append('message', message)
            files.forEach(file => {
                formData.append('files', file)
            })

            const res = await fetch('/api/feedback', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                setSuccess(true)
                setSuccess(true)
                setMessage('')
                setFiles([])
                setTimeout(() => {
                    setSuccess(false)
                    onClose()
                }, 1500)
            } else {
                alert('Failed to send feedback. Please try again.')
            }
        } catch (error) {
            console.error('Error sending feedback:', error)
            alert('Error sending feedback')
        } finally {
            setSending(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all w-full max-w-sm sm:my-8 sm:w-full sm:max-w-lg sm:p-6">

                                {success ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4 animate-bounce" />
                                        <h3 className="text-xl font-bold text-gray-900">Thank You!</h3>
                                        <p className="text-gray-500 mt-2">Feedback sent successfully.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                            <button
                                                type="button"
                                                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                                                onClick={onClose}
                                            >
                                                <span className="sr-only">Close</span>
                                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>

                                        <div>
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                                                <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                                            </div>
                                            <div className="mt-3 text-center sm:mt-5">
                                                <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                                    Send Mobile Feedback
                                                </Dialog.Title>
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500">
                                                        Found a bug or have an idea? sketch it out!
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <form onSubmit={handleSubmit} className="mt-5 sm:mt-6">
                                            <div className="mb-4">
                                                <textarea
                                                    rows={4}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                                    placeholder="Type your message here..."
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                />
                                            </div>

                                            {/* File Attachment */}
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                        className="hidden"
                                                        multiple
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                                                    >
                                                        <PaperClipIcon className="h-5 w-5 mr-1" />
                                                        Attach Screenshot(s)
                                                    </button>
                                                </div>

                                                {/* File List */}
                                                {files.length > 0 && (
                                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                                        {files.map((f, i) => (
                                                            <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded text-xs">
                                                                <span className="truncate max-w-[200px] text-gray-700">{f.name}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFile(i)}
                                                                    className="text-red-500 hover:text-red-700 ml-2"
                                                                >
                                                                    <XMarkIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={sending}
                                                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:opacity-50"
                                                >
                                                    {sending ? 'Sending...' : 'Send'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                                                    onClick={onClose}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
