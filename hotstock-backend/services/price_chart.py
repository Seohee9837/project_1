import FinanceDataReader as fdr
import plotly.graph_objs as go
from plotly.subplots import make_subplots
from datetime import datetime, timedelta

def format_volume(v):
    if v >= 1e8:
        return f"{v / 1e8:.1f}억"
    elif v >= 1e4:
        return f"{v / 1e4:.1f}만"
    else:
        return str(v)

def get_price_chart(ticker: str):
    # 날짜 범위 설정 (1년 전 ~ 어제)
    end_date = datetime.today() - timedelta(days=1)
    start_date = end_date - timedelta(days=365)

    start = start_date.strftime('%Y-%m-%d')
    end = end_date.strftime('%Y-%m-%d')

    # 데이터 가져오기
    df = fdr.DataReader(ticker, start, end)
    if df.empty:
        print(f"[❌] '{ticker}'에 대한 데이터를 찾을 수 없습니다.")
        return

    df['Change'] = df['Close'].diff()
    colors = ['red' if c > 0 else 'blue' for c in df['Change']]

    # 그래프 구성
    fig = make_subplots(
        rows=2, cols=1,
        shared_xaxes=True,
        vertical_spacing=0.05,
        row_heights=[0.7, 0.3],
        subplot_titles=(f"{ticker} 주가 선형 차트", "거래량")
    )

    fig.add_trace(go.Scatter(
        x=df.index,
        y=df['Close'],
        mode='lines+markers',
        name='종가',
        line=dict(color='blue'),
        hovertemplate='날짜: %{x|%Y-%m-%d}<br>종가: %{y:,.0f}₩<extra></extra>'
    ), row=1, col=1)

    fig.add_trace(go.Bar(
        x=df.index,
        y=df['Volume'],
        marker_color=colors,
        name='거래량',
        hovertemplate='날짜: %{x|%Y-%m-%d}<br>거래량: %{customdata}<extra></extra>',
        customdata=[format_volume(v) for v in df['Volume']]
    ), row=2, col=1)

    fig.update_layout(
        height=600,
        showlegend=True,
        hovermode='x unified',
        font=dict(family='Malgun Gothic', size=12),
        margin=dict(t=50)
    )

    fig.update_yaxes(title_text="가격 (₩)", row=1, col=1, tickformat=',')
    fig.update_yaxes(title_text="거래량", row=2, col=1, tickformat=',')

    fig.show()