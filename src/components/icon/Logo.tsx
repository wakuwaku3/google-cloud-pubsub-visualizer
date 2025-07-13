import "./Logo.css";

interface LogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function Logo({
  size = 200,
  className = "",
  animated = true,
}: LogoProps) {
  return (
    <div
      className={`logo-container ${animated ? "animated" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        <defs>
          {/* グラデーション定義 */}
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#4285F4", stopOpacity: 1 }}
            />
            <stop
              offset="50%"
              style={{ stopColor: "#34A853", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#FBBC04", stopOpacity: 1 }}
            />
          </linearGradient>

          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#EA4335", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#FF6B35", stopOpacity: 1 }}
            />
          </linearGradient>

          {/* 影の定義 */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="2"
              dy="4"
              stdDeviation="3"
              floodColor="#000000"
              floodOpacity="0.3"
            />
          </filter>

          {/* アニメーション定義 */}
          {animated && (
            <>
              <animateTransform
                xlinkHref="#message1"
                attributeName="transform"
                type="translate"
                values="0,0; 0,-5; 0,0"
                dur="2s"
                repeatCount="indefinite"
                begin="0s"
              />

              <animateTransform
                xlinkHref="#message2"
                attributeName="transform"
                type="translate"
                values="0,0; 0,-5; 0,0"
                dur="2s"
                repeatCount="indefinite"
                begin="0.5s"
              />

              <animateTransform
                xlinkHref="#message3"
                attributeName="transform"
                type="translate"
                values="0,0; 0,-5; 0,0"
                dur="2s"
                repeatCount="indefinite"
                begin="1s"
              />
            </>
          )}
        </defs>

        {/* 背景円 */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="url(#bgGradient)"
          filter="url(#shadow)"
        />

        {/* 内側の円（グラスモーフィズム効果） */}
        <circle
          cx="100"
          cy="100"
          r="75"
          fill="rgba(255,255,255,0.1)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />

        {/* メインアイコン（Pub/Subの概念） */}
        <g transform="translate(100, 100)">
          {/* トピック（送信側） */}
          <rect
            x="-60"
            y="-25"
            width="50"
            height="50"
            rx="8"
            fill="url(#iconGradient)"
            opacity="0.9"
          />
          <text
            x="-35"
            y="5"
            textAnchor="middle"
            fill="white"
            fontFamily="Arial, sans-serif"
            fontSize="12"
            fontWeight="bold"
          >
            T
          </text>

          {/* サブスクリプション（受信側） */}
          <rect
            x="10"
            y="-25"
            width="50"
            height="50"
            rx="8"
            fill="url(#iconGradient)"
            opacity="0.9"
          />
          <text
            x="35"
            y="5"
            textAnchor="middle"
            fill="white"
            fontFamily="Arial, sans-serif"
            fontSize="12"
            fontWeight="bold"
          >
            S
          </text>

          {/* メッセージの流れを表す矢印 */}
          <path
            d="M -10 -5 L 10 -5 M 5 -8 L 10 -5 L 5 -2"
            stroke="white"
            strokeWidth="3"
            fill="none"
            opacity="0.8"
          />

          {/* 浮遊するメッセージアイコン */}
          <g id="message1" transform="translate(-25, -40)">
            <circle cx="0" cy="0" r="8" fill="rgba(255,255,255,0.8)" />
            <text
              x="0"
              y="3"
              textAnchor="middle"
              fill="#4285F4"
              fontFamily="Arial, sans-serif"
              fontSize="10"
              fontWeight="bold"
            >
              M
            </text>
          </g>

          <g id="message2" transform="translate(0, -45)">
            <circle cx="0" cy="0" r="6" fill="rgba(255,255,255,0.6)" />
            <text
              x="0"
              y="2"
              textAnchor="middle"
              fill="#34A853"
              fontFamily="Arial, sans-serif"
              fontSize="8"
              fontWeight="bold"
            >
              M
            </text>
          </g>

          <g id="message3" transform="translate(25, -35)">
            <circle cx="0" cy="0" r="7" fill="rgba(255,255,255,0.7)" />
            <text
              x="0"
              y="2"
              textAnchor="middle"
              fill="#FBBC04"
              fontFamily="Arial, sans-serif"
              fontSize="9"
              fontWeight="bold"
            >
              M
            </text>
          </g>
        </g>

        {/* 装飾的な要素 */}
        <circle cx="30" cy="30" r="3" fill="rgba(255,255,255,0.3)" />
        <circle cx="170" cy="40" r="2" fill="rgba(255,255,255,0.4)" />
        <circle cx="160" cy="160" r="4" fill="rgba(255,255,255,0.2)" />
        <circle cx="40" cy="170" r="2.5" fill="rgba(255,255,255,0.3)" />
      </svg>
    </div>
  );
}
