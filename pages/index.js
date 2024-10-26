import Layout from "@/components/Layout";
import {useSession} from "next-auth/react";

export default function Home() {
  const {data: session} = useSession();
  return <Layout>
    <div className="text-blue-900 flex justify-between">
      <h2>
        Hello, <b>{session?.user?.name}</b>
      </h2>
      <div className="flex gap-1 text-black rounded-lg overflow-hidden">
        <img src={session?.user?.image} alt="" className="w-6 h-6 rounded-full"/>
        <span className="px-2 bg-gray-300">
          {session?.user?.name}
        </span>
      </div>
    </div>
    <div>
      <br />
      <br />
      Change you products however you want. 
    </div>
  </Layout>
}



//http://localhost:3000/api/auth/callback/google