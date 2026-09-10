import { NextResponse } from "next/server";

const UPSTREAM = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`

//TODO : add a methods whitelist to secure the newly alchemy opened proxy
//TODO : restrcit api key for our dApp web domain
export async function POST(request: Request) {
  if (!process.env.INFURA_API_KEY) {
    return NextResponse.json({error: 'RPC not configured'}, {status: 500})
  }

  //we are using plain text cause viem is already sending JSON-RPC
  const body = await request.text()

  try {
    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'appliation/json' },
      body
    })

    return new NextResponse(await upstream.text(), {
      status: upstream.status, //propagating response status
      headers: {'Content-Type' : 'applicaiton/json'}
    })
  } catch (e) {
    console.error('RPC proxy error ; ', e)
    return NextResponse.json({error: 'Upstream failed'}, {status: 502})
  }
}
