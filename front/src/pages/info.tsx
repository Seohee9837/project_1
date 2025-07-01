import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import InfoMain from "@/components/Info/InfoMain"

const InfoPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const defaultTicker = searchParams.get("ticker") || "005930"
  const [ticker, setTicker] = useState(defaultTicker)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchData = async (tk: string) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`http://127.0.0.1/:8000/company/${tk}/detail-data`)
      if (!res.ok) throw new Error("서버 응답 오류")
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError("데이터를 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(ticker)
  }, [])

  const handleSearch = () => {
    fetchData(ticker)
  }

  const goToOpinion = () => {
    navigate(`/opinion?ticker=${ticker}`)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2 items-center">
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="border p-2 rounded w-40"
          placeholder="티커 입력"
        />
        <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">
          조회
        </button>
        <button onClick={goToOpinion} className="bg-gray-500 text-white px-4 py-2 rounded">
          여론 보기 →
        </button>
      </div>

      {loading && <p>🔄 불러오는 중...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {data && <InfoMain data={data} />}
    </div>
  )
}

export default InfoPage
