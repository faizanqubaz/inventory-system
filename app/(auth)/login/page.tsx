"use client";

import Image from "next/image";
import office from '../../../public/images/office.jpg'
import MyHeading from "@/components/common/heading";
import MyInput from "@/components/common/input";
import MyButton from "@/components/common/button";
import LoginForm from "@/components/ui/loginForm";

export default function LoginPage() {


  return (

    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-green-100 p-4 sm:p-8">
      <div className="mx-auto grid min-h-[85vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

        {/* Left side: Login */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md">

            {/* Logo */}
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-indigo-700 text-2xl font-bold text-white shadow-lg">
                A
              </div>
              <div>
                <MyHeading children="AccountFlow" headingcls="text-xl font-bold text-slate-900" />
                <p className="text-sm text-slate-500">
                  Accounting & Procurement
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-700">
                Welcome back
              </p>
              <MyHeading children="Sign in to your account" headingcls="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl" />
              <p className="mt-3 leading-6 text-slate-500">
                Manage your requests, approvals, and finances in one place.
              </p>
            </div>

            {/* Form */}
            <LoginForm />

            <p className="mt-8 text-center text-xs leading-5 text-slate-500">
              Secure access for authorized employees and administrators.
            </p>
          </div>
        </section>

        {/* Right side: Image */}
        <section className="relative hidden min-h-full overflow-hidden bg-slate-950 lg:block">
          <Image
            src={office}
            alt="Modern professional office"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />

          {/* Image overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-green-900/20" />

          {/* Text over image */}
          <div className="absolute inset-x-0 bottom-0 p-10 text-white xl:p-14">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
              Built for better business
            </span>

            <h2 className="mt-5 text-3xl font-bold leading-tight xl:text-4xl">
              Every request.
              <br />
              Every approval.
              <br />
              All under control.
            </h2>

            <p className="mt-4 max-w-md leading-7 text-slate-200">
              Bring purchasing, accounting, and financial management together
              in one organized workspace.
            </p>

            <div className="mt-8 flex gap-6 text-sm text-slate-200">
              <span>✓ Easy approvals</span>
              <span>✓ Clear records</span>
            </div>
          </div>
        </section>

      </div>

      <p className="mt-5 text-center text-xs text-slate-500">
        © 2026 AccountFlow. All rights reserved.
      </p>
    </main>

  );
}
