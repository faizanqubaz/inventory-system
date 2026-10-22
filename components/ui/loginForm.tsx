import MyButton from "../common/button";
import MyInput from "../common/input";

export default function LoginForm(){
    return (
             <form className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Company email
                </label>
                <MyInput name="email" id="email" type="email" placeholder="you@company.com" inpcls="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-600/10" />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
           
                <MyInput name="password" id="password" type="password" placeholder="Enter your password" inpcls="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-600/10" required={true} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                 
                  <MyInput type="checkbox"  inpcls="h-4 w-4 accent-green-700"/>
                  Remember me
                </label>
               

                <MyButton type='submit' children="Forgot password?" btncls="font-semibold text-green-700 hover:text-green-900" />
              </div>            
              <MyButton children="Login" type="submit" btncls="w-full rounded-xl bg-gradient-to-r from-green-600 to-indigo-700 px-4 py-3.5 font-semibold text-white shadow-lg shadow-green-900/20 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-600/20" />
            </form>
    )
}