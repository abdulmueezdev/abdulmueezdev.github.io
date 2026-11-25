import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react'
import { createPortal, flushSync } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import type { SakugaProgressElement } from '../../types/sakuga'
import { RallyWordmarkBackground } from './RallyWordmarkBackground'

interface ContactModalPageProps {
  isOpen: boolean
  usedViewTransition: boolean
  onClose: () => void
}

interface FormValues {
  name: string
  email: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

type FieldKey = keyof FormValues

const FORMSUBMIT_ACTION = 'https://formsubmit.co/abdulmueezshahid550@gmail.com'
const FORMSUBMIT_AJAX = 'https://formsubmit.co/ajax/abdulmueezshahid550@gmail.com'
const WEB3FORMS_SUBMIT = 'https://api.web3forms.com/submit'
const INITIAL_VALUES: FormValues = { name: '', email: '', message: '' }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ENTER_EASE = [0.22, 1, 0.36, 1] as const
const CLOSE_BUTTON_BURST_MS = 240

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (values.name.trim().length < 2) {
    errors.name = 'Please enter your name.'
  }
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }
  if (values.message.trim().length < 10) {
    errors.message = 'Please enter at least 10 characters.'
  }
  return errors
}

function CornerWedges({ visible, reduceMotion }: { visible: boolean; reduceMotion: boolean }) {
  if (!visible || reduceMotion) return null
  return (
    <motion.svg
      className="sakuga-corner-ticks"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.45, rotate: -12 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 520, damping: 18 }}
    >
      <polygon points="10,16 14,3 17,5" />
      <polygon points="13,18 22,8 23,12" />
      <polygon points="6,14 7,4 10,4" />
    </motion.svg>
  )
}

export function ContactModalPage({ isOpen, usedViewTransition, onClose }: ContactModalPageProps) {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})
  const [focusedField, setFocusedField] = useState<FieldKey | null>(null)
  const [kickField, setKickField] = useState<FieldKey | null>(null)
  const [impactActive, setImpactActive] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [needsActivation, setNeedsActivation] = useState(false)
  const [submitted, setSubmitted] = useState<FormValues | null>(null)

  const overlayRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const progressRef = useRef<SakugaProgressElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const pendingSuccessRef = useRef<FormValues | null>(null)
  const isClosingRef = useRef(false)
  const impactTimeoutRef = useRef<number | null>(null)
  const kickTimeoutRef = useRef<number | null>(null)
  const surgeTimeoutRef = useRef<number | null>(null)
  const closeTimeoutRef = useRef<number | null>(null)

  const shouldReduceMotion = Boolean(useReducedMotion())

  const triggerSequencedClose = useCallback(() => {
    if (isClosingRef.current) return
    if (shouldReduceMotion) {
      onClose()
      return
    }
    isClosingRef.current = true
    setIsClosing(true)
    if (closeTimeoutRef.current !== null) window.clearTimeout(closeTimeoutRef.current)
    closeTimeoutRef.current = window.setTimeout(() => {
      closeTimeoutRef.current = null
      isClosingRef.current = false
      setIsClosing(false)
      onClose()
    }, CLOSE_BUTTON_BURST_MS)
  }, [onClose, shouldReduceMotion])

  // Lock root scrolling cleanly while the dialog is open
  useEffect(() => {
    if (!isOpen) {
      isClosingRef.current = false
      setIsClosing(false)
      setSubmitting(false)
      pendingSuccessRef.current = null
      if (surgeTimeoutRef.current !== null) {
        window.clearTimeout(surgeTimeoutRef.current)
        surgeTimeoutRef.current = null
      }
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      return
    }
    if (overlayRef.current) {
      overlayRef.current.scrollTop = 0
    }

    const focusRaf = requestAnimationFrame(() => {
      nameInputRef.current?.focus({ preventScroll: true })
    })

    return () => {
      cancelAnimationFrame(focusRaf)
    }
  }, [isOpen])

  // Transition to confirmation ONLY after <sakuga-progress> dispatches sakuga:done
  useEffect(() => {
    const progressEl = progressRef.current
    if (!progressEl || !isOpen || !submitting) return

    const handleSakugaDone = () => {
      const resolved = pendingSuccessRef.current
      if (!resolved) return
      pendingSuccessRef.current = null
      setSubmitting(false)
      setSubmitted(resolved)
    }

    progressEl.addEventListener('sakuga:done', handleSakugaDone)
    return () => {
      progressEl.removeEventListener('sakuga:done', handleSakugaDone)
    }
  }, [isOpen, submitting])

  // Keyboard Escape close and focus trap within the dialog
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        triggerSequencedClose()
        return
      }

      if (event.key !== 'Tab' || !overlayRef.current) return
      const focusables = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, triggerSequencedClose])

  useEffect(() => {
    return () => {
      if (impactTimeoutRef.current !== null) window.clearTimeout(impactTimeoutRef.current)
      if (kickTimeoutRef.current !== null) window.clearTimeout(kickTimeoutRef.current)
      if (surgeTimeoutRef.current !== null) window.clearTimeout(surgeTimeoutRef.current)
      if (closeTimeoutRef.current !== null) window.clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  const handleFieldChange = useCallback(
    (field: FieldKey, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
      if (submitError) setSubmitError(null)
      if (needsActivation) setNeedsActivation(false)

      if (!shouldReduceMotion) {
        setKickField(field)
        if (kickTimeoutRef.current !== null) window.clearTimeout(kickTimeoutRef.current)
        kickTimeoutRef.current = window.setTimeout(() => setKickField(null), 130)
      }
    },
    [shouldReduceMotion, submitError, needsActivation],
  )

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (submitting) return

      const nextErrors = validateForm(values)
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors)
        if (nextErrors.name) nameInputRef.current?.focus()
        else if (nextErrors.email) emailInputRef.current?.focus()
        else if (nextErrors.message) messageInputRef.current?.focus()
        return
      }

      const cleanValues: FormValues = {
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      }

      pendingSuccessRef.current = null
      if (surgeTimeoutRef.current !== null) {
        window.clearTimeout(surgeTimeoutRef.current)
        surgeTimeoutRef.current = null
      }

      if (!shouldReduceMotion) {
        setImpactActive(true)
        if (impactTimeoutRef.current !== null) window.clearTimeout(impactTimeoutRef.current)
        impactTimeoutRef.current = window.setTimeout(() => setImpactActive(false), 150)
      }

      flushSync(() => {
        setSubmitting(true)
        setSubmitError(null)
        setNeedsActivation(false)
      })

      const progressEl = progressRef.current
      if (progressEl && typeof progressEl.reset === 'function' && typeof progressEl.set === 'function') {
        progressEl.reset()
        progressEl.set(0.25)
        surgeTimeoutRef.current = window.setTimeout(() => {
          if (pendingSuccessRef.current === null && progressRef.current) {
            progressRef.current.set(0.65)
          }
        }, 180)
      }

      const web3FormsKey = import.meta.env.VITE_WEB3FORMS_KEY?.trim() || ''

      try {
        let response: Response
        if (web3FormsKey) {
          response = await fetch(WEB3FORMS_SUBMIT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              access_key: web3FormsKey,
              name: cleanValues.name,
              email: cleanValues.email,
              message: cleanValues.message,
              subject: `Portfolio Inquiry from ${cleanValues.name}`,
            }),
          })
        } else {
          const formData = new FormData()
          formData.append('name', cleanValues.name)
          formData.append('email', cleanValues.email)
          formData.append('message', cleanValues.message)
          formData.append('_subject', `Portfolio Inquiry from ${cleanValues.name}`)
          formData.append('_template', 'table')
          formData.append('_captcha', 'false')

          response = await fetch(FORMSUBMIT_AJAX, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
            },
            body: formData,
          })
        }

        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          const errorDetail =
            payload && typeof payload.message === 'string' && payload.message
              ? payload.message
              : `Delivery failed with status ${response.status}`
          throw new Error(errorDetail)
        }

        const isSuccess = payload?.success === true || payload?.success === 'true'
        if (!isSuccess) {
          const msg =
            payload && typeof payload.message === 'string' && payload.message
              ? payload.message
              : 'Unable to send message.'
          throw new Error(msg)
        }

        if (surgeTimeoutRef.current !== null) {
          window.clearTimeout(surgeTimeoutRef.current)
          surgeTimeoutRef.current = null
        }

        const activeProgress = progressRef.current
        if (activeProgress && typeof activeProgress.set === 'function') {
          pendingSuccessRef.current = cleanValues
          activeProgress.set(1)
        } else {
          setSubmitted(cleanValues)
          setSubmitting(false)
        }
      } catch (err) {
        if (surgeTimeoutRef.current !== null) {
          window.clearTimeout(surgeTimeoutRef.current)
          surgeTimeoutRef.current = null
        }
        pendingSuccessRef.current = null
        progressRef.current?.reset?.()
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Network error while sending. Please try again.'
        setNeedsActivation(!web3FormsKey)
        setSubmitError(message)
        setSubmitting(false)
      }
    },
    [values, submitting, shouldReduceMotion],
  )

  const handleStandardPostFallback = useCallback(() => {
    const formEl = formRef.current
    if (!formEl) return
    const prevTarget = formEl.target
    formEl.target = '_blank'
    HTMLFormElement.prototype.submit.call(formEl)
    window.setTimeout(() => {
      formEl.target = prevTarget
    }, 0)
  }, [])

  const handleReset = useCallback(() => {
    setValues(INITIAL_VALUES)
    setErrors({})
    setSubmitting(false)
    setSubmitError(null)
    setNeedsActivation(false)
    pendingSuccessRef.current = null
    progressRef.current?.reset?.()
    setSubmitted(null)
    requestAnimationFrame(() => nameInputRef.current?.focus())
  }, [])

  if (typeof document === 'undefined') return null

  const staggerBase = shouldReduceMotion ? 0 : usedViewTransition ? 0.14 : 0.04
  const skipFadeOnEnter = usedViewTransition || shouldReduceMotion
  const supportsViewTransitionClose =
    !shouldReduceMotion &&
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    typeof document.startViewTransition === 'function'

  const overlayNode = isOpen ? (
    <motion.div
      ref={overlayRef}
      className="contact-page-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-page-heading"
      data-cursor-theme="ember"
      data-lenis-prevent
      initial={skipFadeOnEnter ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={supportsViewTransitionClose || shouldReduceMotion ? undefined : { opacity: 0 }}
      transition={skipFadeOnEnter ? { duration: 0 } : { duration: 0.24, ease: ENTER_EASE }}
    >
      <RallyWordmarkBackground
        isOpen={isOpen}
        reduceMotion={shouldReduceMotion}
        overlayRef={overlayRef}
      />
      <div className="contact-page-inner">
            <motion.header
              className="contact-page-topbar"
              initial={skipFadeOnEnter ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                skipFadeOnEnter
                  ? { duration: 0 }
                  : { duration: 0.42, delay: staggerBase, ease: ENTER_EASE }
              }
            >
              <div className="contact-page-brand">
                <b className="contact-page-wordmark" aria-hidden="true">
                  A<span>/</span>M
                </b>
                <span>Abdul Mueez</span>
              </div>
              <motion.button
                type="button"
                className={`contact-close-btn${isClosing ? ' is-closing' : ''}`}
                onClick={triggerSequencedClose}
                aria-label="Close contact form"
                animate={
                  isClosing && !shouldReduceMotion
                    ? { scale: [1, 0.88, 1.05, 1], y: [0, 3, -1, 0] }
                    : { scale: 1, y: 0 }
                }
                transition={{
                  duration: CLOSE_BUTTON_BURST_MS / 1000,
                  times: [0, 0.35, 0.72, 1],
                  ease: ENTER_EASE,
                }}
              >
                <CornerWedges visible={isClosing} reduceMotion={shouldReduceMotion} />
                <span>Close</span>
                <span aria-hidden="true">[ESC]</span>
              </motion.button>
            </motion.header>

            <div className="contact-page-grid">
              <div className="contact-page-left">
                <h2 className="contact-page-title" id="contact-page-heading">
                  <motion.span
                    className="contact-page-title-line"
                    initial={skipFadeOnEnter ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      skipFadeOnEnter
                        ? { duration: 0 }
                        : { duration: 0.48, delay: staggerBase + 0.06, ease: ENTER_EASE }
                    }
                  >
                    Send a
                  </motion.span>
                  <motion.span
                    className="contact-page-title-line ember-text"
                    initial={skipFadeOnEnter ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      skipFadeOnEnter
                        ? { duration: 0 }
                        : { duration: 0.48, delay: staggerBase + 0.14, ease: ENTER_EASE }
                    }
                  >
                    Signal
                  </motion.span>
                </h2>
                <motion.p
                  className="contact-page-lead"
                  initial={skipFadeOnEnter ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    skipFadeOnEnter
                      ? { duration: 0 }
                      : { duration: 0.46, delay: staggerBase + 0.22, ease: ENTER_EASE }
                  }
                >
                  Have a build, system architecture challenge, or opportunity in mind? Leave a direct note below.
                </motion.p>

                <motion.dl
                  className="contact-page-meta-list"
                  initial={skipFadeOnEnter ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    skipFadeOnEnter
                      ? { duration: 0 }
                      : { duration: 0.46, delay: staggerBase + 0.28, ease: ENTER_EASE }
                  }
                >
                  <div className="contact-page-meta-row">
                    <dt>Direct Mailbox</dt>
                    <dd>
                      <a href="mailto:abdulmueezshahid550@gmail.com">
                        abdulmueezshahid550@gmail.com
                      </a>
                    </dd>
                  </div>
                  <div className="contact-page-meta-row">
                    <dt>Timezone</dt>
                    <dd>PKT · UTC+5</dd>
                  </div>
                </motion.dl>
              </div>

              <motion.div
                className="sakuga-form-card"
                initial={skipFadeOnEnter ? false : { opacity: 0, y: 22, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={
                  skipFadeOnEnter
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 320, damping: 26, delay: staggerBase + 0.18 }
                }
              >
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="confirm"
                      className="sakuga-confirm"
                      role="status"
                      aria-live="polite"
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 24 }}
                    >
                      <span className="sakuga-confirm-badge" data-cursor-theme="light">
                        <svg viewBox="0 0 24 18" width="15" height="12" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 9.5l6 6L21 2.5" />
                        </svg>
                        Signal Received
                      </span>

                      <h3 className="sakuga-confirm-title">Signal Received</h3>
                      <p className="sakuga-confirm-copy">
                        Thanks, {submitted.name}. Your note has been delivered directly to Abdul Mueez.
                      </p>

                      <blockquote className="sakuga-confirm-summary">
                        <strong>{submitted.email}</strong>
                        <br />
                        {submitted.message}
                      </blockquote>

                      <div className="sakuga-confirm-actions">
                        <button
                          type="button"
                          className="sakuga-action-secondary"
                          onClick={handleReset}
                        >
                          Send Another
                        </button>
                        <button
                          type="button"
                          className="sakuga-action-secondary"
                          onClick={onClose}
                        >
                          Back to Portfolio
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form-stage"
                      className="sakuga-form-stage"
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                    >
                      <form
                        ref={formRef}
                        className={`sakuga-form${submitting ? ' is-submitting' : ''}`}
                        action={FORMSUBMIT_ACTION}
                        method="POST"
                        noValidate
                        onSubmit={handleSubmit}
                        aria-hidden={submitting}
                      >
                      <input
                        type="hidden"
                        name="_subject"
                        value={`Portfolio Inquiry from ${values.name.trim() || 'Visitor'}`}
                      />
                      <input type="hidden" name="_captcha" value="false" />
                      <input type="hidden" name="_template" value="table" />

                      <div className="sakuga-field">
                        <div className="sakuga-label-row">
                          <label className="sakuga-label" htmlFor="contact-name">
                            Name<span className="sakuga-required" aria-hidden="true">*</span>
                          </label>
                          <span className="sakuga-field-index" aria-hidden="true">01</span>
                        </div>
                        <motion.div
                          className="sakuga-input-shell"
                          animate={
                            kickField === 'name' && !shouldReduceMotion
                              ? { scale: 1.008 }
                              : { scale: 1 }
                          }
                          transition={{ type: 'spring', stiffness: 650, damping: 18 }}
                        >
                          <CornerWedges visible={focusedField === 'name'} reduceMotion={shouldReduceMotion} />
                          <input
                            ref={nameInputRef}
                            id="contact-name"
                            name="name"
                            type="text"
                            required
                            disabled={submitting}
                            tabIndex={submitting ? -1 : undefined}
                            autoComplete="name"
                            placeholder="Your Name"
                            value={values.name}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? 'contact-name-error' : undefined}
                            className={`sakuga-control${errors.name ? ' is-invalid' : ''}`}
                          />
                        </motion.div>
                        {errors.name && (
                          <p id="contact-name-error" className="sakuga-error" role="alert">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="sakuga-field">
                        <div className="sakuga-label-row">
                          <label className="sakuga-label" htmlFor="contact-email">
                            Email<span className="sakuga-required" aria-hidden="true">*</span>
                          </label>
                          <span className="sakuga-field-index" aria-hidden="true">02</span>
                        </div>
                        <motion.div
                          className="sakuga-input-shell"
                          animate={
                            kickField === 'email' && !shouldReduceMotion
                              ? { scale: 1.008 }
                              : { scale: 1 }
                          }
                          transition={{ type: 'spring', stiffness: 650, damping: 18 }}
                        >
                          <CornerWedges visible={focusedField === 'email'} reduceMotion={shouldReduceMotion} />
                          <input
                            ref={emailInputRef}
                            id="contact-email"
                            name="email"
                            type="email"
                            required
                            disabled={submitting}
                            tabIndex={submitting ? -1 : undefined}
                            autoComplete="email"
                            placeholder="email@example.com"
                            value={values.email}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'contact-email-error' : undefined}
                            className={`sakuga-control${errors.email ? ' is-invalid' : ''}`}
                          />
                        </motion.div>
                        {errors.email && (
                          <p id="contact-email-error" className="sakuga-error" role="alert">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="sakuga-field">
                        <div className="sakuga-label-row">
                          <label className="sakuga-label" htmlFor="contact-message">
                            Message<span className="sakuga-required" aria-hidden="true">*</span>
                          </label>
                          <span className="sakuga-field-index" aria-hidden="true">03</span>
                        </div>
                        <motion.div
                          className="sakuga-input-shell"
                          animate={
                            kickField === 'message' && !shouldReduceMotion
                              ? { scale: 1.006 }
                              : { scale: 1 }
                          }
                          transition={{ type: 'spring', stiffness: 650, damping: 18 }}
                        >
                          <CornerWedges visible={focusedField === 'message'} reduceMotion={shouldReduceMotion} />
                          <textarea
                            ref={messageInputRef}
                            id="contact-message"
                            name="message"
                            rows={3}
                            required
                            disabled={submitting}
                            tabIndex={submitting ? -1 : undefined}
                            placeholder="Drop your message here..."
                            value={values.message}
                            onFocus={() => setFocusedField('message')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => handleFieldChange('message', e.target.value)}
                            aria-invalid={Boolean(errors.message)}
                            aria-describedby={errors.message ? 'contact-message-error' : undefined}
                            className={`sakuga-control sakuga-textarea${errors.message ? ' is-invalid' : ''}`}
                          />
                        </motion.div>
                        {errors.message && (
                          <p id="contact-message-error" className="sakuga-error" role="alert">
                            {errors.message}
                          </p>
                        )}
                      </div>

                      {submitError && (
                        <div className="sakuga-error-box" role="alert">
                          <p className="sakuga-error">{submitError}</p>
                          {needsActivation && (
                            <div className="sakuga-activation-row">
                              <button
                                type="button"
                                className="sakuga-activation-btn"
                                onClick={handleStandardPostFallback}
                              >
                                <span>Activate Form Now</span>
                                <span aria-hidden="true">↗</span>
                              </button>
                              <p className="sakuga-activation-note">
                                Opens FormSubmit in a new tab to dispatch the activation link (check Spam if not in Primary).
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="sakuga-submit-wrap">
                        <motion.button
                          type="submit"
                          disabled={submitting}
                          aria-busy={submitting}
                          data-cursor-theme="light"
                          className={`sakuga-submit-btn${impactActive ? ' is-impact' : ''}`}
                          whileHover={shouldReduceMotion || submitting ? undefined : { scale: 1.015, y: -2 }}
                          whileTap={shouldReduceMotion || submitting ? undefined : { scaleX: 1.03, scaleY: 0.92 }}
                          transition={{ type: 'spring', stiffness: 460, damping: 16 }}
                        >
                          <span>{submitting ? 'SENDING...' : 'Send Message'}</span>
                          <span aria-hidden="true">{submitting ? '·' : '↗'}</span>
                        </motion.button>
                      </div>
                      </form>

                      {submitting && (
                        <motion.div
                          className="sakuga-card-progress-layer"
                          role="status"
                          aria-live="polite"
                          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18, ease: ENTER_EASE }}
                        >
                          <div className="sakuga-progress-slot">
                            <sakuga-progress
                              ref={progressRef}
                              label="Sending your message"
                            ></sakuga-progress>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </motion.div>
  ) : null

  return createPortal(
    supportsViewTransitionClose ? overlayNode : <AnimatePresence>{overlayNode}</AnimatePresence>,
    document.body,
  )
}
