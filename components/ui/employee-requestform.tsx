
"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, ShoppingCart, X, CheckCircle2 } from "lucide-react";
import MyInput from "../common/input";
import MyButton from "../common/button";
import { FormState } from "@/types/user";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { createPurchaseRequest } from "@/thunk/purchaseRequestThunk";

const initialForm: FormState = {
  itemName: "",
  category: "",
  quantity: "",
  amount: "",
  description: "",
  date: "",
};

const MAX_RECEIPT_MB = 5;

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
};

function Field({
  label,
  htmlFor,
  hint,
  className = "",
  children,
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      {children}

      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 " +
  "placeholder:text-slate-400 outline-none transition " +
  "focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15";

export default function EmployeeRequestForm() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: any) => state.auth.user);

  console.log("Logged-in employee:", user);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(initialForm);

  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // Handle text inputs
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create and clean up receipt preview URL
  useEffect(() => {
    if (!receipt) {
      setReceiptPreview("");
      return;
    }

    const url = URL.createObjectURL(receipt);
    setReceiptPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [receipt]);

  // Validate receipt image
  const handleReceiptChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setReceiptError(
        "Please choose an image file (JPG, PNG or WebP)."
      );
      e.target.value = "";
      return;
    }

    if (file.size > MAX_RECEIPT_MB * 1024 * 1024) {
      setReceiptError(
        `Image must be smaller than ${MAX_RECEIPT_MB} MB.`
      );
      e.target.value = "";
      return;
    }

    setReceiptError("");
    setReceipt(file);
  };

  // Remove receipt image
  const removeReceipt = () => {
    setReceipt(null);
    setReceiptError("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  // Reset form
  const clearForm = () => {
    setForm(initialForm);
    removeReceipt();
    setError("");
  };

  // Submit purchase request
  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    if (!user?.id) {
      setError("Please log in before submitting a request.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await dispatch(
        createPurchaseRequest({
          ...form,
          receipt,
          employeeId: user.id,
        })
      ).unwrap();

      clearForm();
      setShowSuccessModal(true);
    } catch (err: unknown) {
      setError(
        typeof err === "string"
          ? err
          : "Failed to submit purchase request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <section className="mx-auto mb-8 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Heading */}
        <header className="flex items-start gap-4 border-b border-slate-200 px-5 py-5 sm:px-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
            <ShoppingCart size={22} />
          </span>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              New purchase request
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tell us what you need. Your manager will review it.
            </p>
          </div>
        </header>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="px-5 py-6 sm:px-8 sm:py-8"
        >
          <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
            <Field
              label="Item name"
              htmlFor="itemName"
              className="sm:col-span-2"
            >
              <MyInput
                id="itemName"
                name="itemName"
                value={form.itemName}
                handleChange={handleChange}
                placeholder="e.g. Wireless keyboard"
                inpcls={inputCls}
                required
              />
            </Field>

            <Field label="Category" htmlFor="category">
              <MyInput
                id="category"
                name="category"
                value={form.category}
                handleChange={handleChange}
                placeholder="e.g. Office supplies"
                inpcls={inputCls}
                required
              />
            </Field>

            <Field label="Needed by" htmlFor="date">
              <MyInput
                id="date"
                name="date"
                type="date"
                value={form.date}
                handleChange={handleChange}
                inpcls={inputCls}
                required
              />
            </Field>

            <Field label="Quantity" htmlFor="quantity">
              <MyInput
                id="quantity"
                name="quantity"
                type="number"
                value={form.quantity}
                handleChange={handleChange}
                placeholder="1"
                inpcls={inputCls}
                required
              />
            </Field>

            <Field
              label="Amount (PKR)"
              htmlFor="amount"
              hint="Total cost of all items."
            >
              <MyInput
                id="amount"
                name="amount"
                type="number"
                value={form.amount}
                handleChange={handleChange}
                placeholder="0"
                inpcls={inputCls}
                required
              />
            </Field>

            <Field
              label="Description"
              htmlFor="description"
              className="sm:col-span-2"
            >
              <textarea
                id="description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Why do you need this? (optional)"
                className={`${inputCls} resize-none`}
              />
            </Field>

            {/* Receipt upload */}
            <Field
              label="Receipt image"
              htmlFor="receipt"
              className="sm:col-span-2"
              hint={`JPG, PNG or WebP, up to ${MAX_RECEIPT_MB} MB. Optional.`}
            >
              <input
                ref={fileRef}
                id="receipt"
                name="receipt"
                type="file"
                accept="image/*"
                onChange={handleReceiptChange}
                className="sr-only"
              />

              {!receiptPreview ? (
                <label
                  htmlFor="receipt"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-teal-600 hover:bg-teal-50/50"
                >
                  <ImagePlus
                    size={28}
                    className="text-slate-400"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    Upload receipt
                  </span>

                  <span className="text-xs text-slate-500">
                    Click to choose a photo from your device
                  </span>
                </label>
              ) : (
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="h-24 w-24 shrink-0 rounded-lg border border-slate-200 bg-white object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {receipt?.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {receipt
                        ? (receipt.size / 1024 / 1024).toFixed(2)
                        : "0"}{" "}
                      MB
                    </p>

                    <label
                      htmlFor="receipt"
                      className="mt-1 inline-block cursor-pointer text-xs font-medium text-teal-700 hover:underline"
                    >
                      Replace image
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={removeReceipt}
                    aria-label="Remove receipt"
                    className="rounded-full p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {receiptError && (
                <p
                  role="alert"
                  className="text-xs font-medium text-red-600"
                >
                  {receiptError}
                </p>
              )}
            </Field>
          </div>

          {/* Error message */}
          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {/* Form actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={clearForm}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Clear form
            </button>

            <MyButton
              type="submit"
              disabled={loading}
              btncls="rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit request"}
            </MyButton>
          </div>
        </form>
      </section>

      {/* Success popup with blurred background */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <div className="w-full max-w-md animate-in zoom-in-95 rounded-2xl bg-white p-8 text-center shadow-2xl duration-200">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2
                size={38}
                strokeWidth={2}
                className="text-emerald-600"
              />
            </div>

            <h2
              id="success-title"
              className="text-2xl font-bold text-slate-900"
            >
              Request Submitted!
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your purchase request has been sent to the admin
              successfully. The admin will review your request.
            </p>

            <button
              type="button"
              autoFocus
              onClick={() => setShowSuccessModal(false)}
              className="mt-7 w-full rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-600/20"
            >
              Okay, Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
