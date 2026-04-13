import { useState, useMemo, useEffect, useCallback } from "react";

const DOMAINS = [
  {
    id: "d1",
    title: "Domain 1: Design Secure Architectures",
    titleZh: "設計安全架構",
    weight: 30,
    color: "#7F77DD",
    sections: [
      {
        id: "s1-1",
        title: "1.1 Secure Access to AWS Resources",
        titleZh: "安全的資源訪問",
        topics: [
          {
            id: "t1",
            term: "IAM — Identity and Access Management",
            zh: "身份與訪問管理",
            desc: "AWS 的核心權限控制服務，管理誰可以做什麼",
            details: [
              "Users (用戶) — 對應具體的人",
              "Groups (組) — 用戶的集合，統一授權",
              "Roles (角色) — 臨時身份，供服務或用戶假扮",
              "Policies (策略) — JSON 格式的權限文檔",
              "Identity-based Policy vs Resource-based Policy",
              "Inline Policy vs Managed Policy",
            ],
          },
          {
            id: "t2",
            term: "Principle of Least Privilege",
            zh: "最小權限原則",
            desc: "只授予完成任務所需的最少權限，不多給",
            details: [],
          },
          {
            id: "t3",
            term: "MFA — Multi-Factor Authentication",
            zh: "多因素認證",
            desc: "除了密碼，還需要第二種驗證方式（如手機驗證碼）",
            details: [
              "Root User 必須開啟 MFA",
              "Virtual MFA / Hardware MFA / U2F Security Key",
            ],
          },
          {
            id: "t4",
            term: "Root User",
            zh: "根用戶",
            desc: "AWS 賬戶的最高權限用戶，盡量不用，鎖起來",
            details: [
              "只用於少數必須的操作（如修改賬單信息）",
              "日常操作用 IAM 用戶或角色",
            ],
          },
          {
            id: "t5",
            term: "STS — Security Token Service",
            zh: "安全令牌服務",
            desc: "為用戶或服務提供臨時的安全憑證",
            details: [
              "AssumeRole — 跨賬戶訪問的核心機制",
              "臨時憑證會過期，比長期密鑰更安全",
              "Role Switching — 在控制台切換角色",
            ],
          },
          {
            id: "t6",
            term: "IAM Identity Center / SSO",
            zh: "單點登錄",
            desc: "一次登錄就能訪問多個 AWS 賬戶和應用",
            details: [
              "Federation 聯合認證 — 對接企業 Active Directory",
              "SAML 2.0 / OpenID Connect 協議",
            ],
          },
          {
            id: "t7",
            term: "AWS Organizations",
            zh: "組織",
            desc: "統一管理多個 AWS 賬戶",
            details: [
              "OU — Organizational Units 組織單元，賬戶分組",
              "SCP — Service Control Policies 服務控制策略",
              "限制子賬戶能做什麼（即使有 Admin 權限也受限）",
              "合併計費 Consolidated Billing，批量折扣",
            ],
          },
          {
            id: "t8",
            term: "AWS Control Tower",
            zh: "控制塔",
            desc: "自動化多賬戶治理和合規，一鍵搭建安全的多賬戶環境",
            details: [
              "Landing Zone — 預配置的安全多賬戶環境",
              "Guardrails — 預防性和檢測性護欄",
            ],
          },
          {
            id: "t9",
            term: "Shared Responsibility Model",
            zh: "共享責任模型",
            desc: "AWS 和客戶各自負責不同層面的安全",
            details: [
              "AWS 負責: 硬件、全球網絡、設施、管理程序安全",
              "客戶負責: 數據加密、IAM、OS 補丁、防火牆規則、應用安全",
              "簡記: AWS 管「雲的安全」，客戶管「雲裡的安全」",
            ],
          },
          {
            id: "t10",
            term: "Region / AZ / Edge Location",
            zh: "區域 / 可用區 / 邊緣節點",
            desc: "AWS 全球基礎設施的三個層級",
            details: [
              "Region — 地理區域（如 us-east-1, ap-northeast-1）",
              "AZ — 區域內獨立的數據中心，互相隔離但低延遲連接",
              "Edge Location — CDN 緩存點，離用戶最近",
            ],
          },
        ],
      },
      {
        id: "s1-2",
        title: "1.2 Secure Workloads & Applications",
        titleZh: "安全的工作負載和應用",
        topics: [
          {
            id: "t11",
            term: "Security Group (SG)",
            zh: "安全組",
            desc: "實例級別的虛擬防火牆，Stateful（有狀態）",
            details: [
              "只設置 Allow 規則，默認拒絕所有入站",
              "Stateful: 允許進來的流量，回覆自動放行",
              "可以引用其他安全組作為來源",
            ],
          },
          {
            id: "t12",
            term: "NACL — Network ACL",
            zh: "網絡訪問控制列表",
            desc: "子網級別的防火牆，Stateless（無狀態）",
            details: [
              "支持 Allow 和 Deny 規則",
              "Stateless: 進出流量都要單獨設規則",
              "按規則編號從小到大順序評估，先匹配先生效",
              "默認 NACL 允許所有流量",
            ],
          },
          {
            id: "t13",
            term: "NAT Gateway vs Internet Gateway",
            zh: "NAT 網關 vs 互聯網網關",
            desc: "兩種不同的外網連接方式",
            details: [
              "IGW — 公有子網連外網的入口，雙向通信",
              "NAT Gateway — 讓私有子網訪問外網（如下載更新），但外網不能主動訪問進來",
              "NAT Gateway 部署在公有子網，私有子網路由指向它",
            ],
          },
          {
            id: "t14",
            term: "Public vs Private Subnet",
            zh: "公有子網 vs 私有子網",
            desc: "子網的公私取決於路由表是否有到 IGW 的路由",
            details: [
              "Public Subnet — 路由表有 0.0.0.0/0 → IGW",
              "Private Subnet — 沒有到 IGW 的路由",
              "Web 層放公有子網，App/DB 層放私有子網",
            ],
          },
          {
            id: "t15",
            term: "AWS Shield",
            zh: "盾牌 — DDoS 防護",
            desc: "保護 AWS 資源免受 DDoS 攻擊",
            details: [
              "Shield Standard — 免費，自動開啟，防護常見 L3/L4 攻擊",
              "Shield Advanced — 付費，高級防護 + 24/7 專家支持 + 成本保護",
            ],
          },
          {
            id: "t16",
            term: "AWS WAF",
            zh: "Web 應用防火牆",
            desc: "過濾惡意的 HTTP/HTTPS 請求",
            details: [
              "防護 SQL Injection, XSS, 等 Web 攻擊",
              "基於規則（Rules）過濾，可自定義",
              "可部署在 ALB, CloudFront, API Gateway 前面",
            ],
          },
          {
            id: "t17",
            term: "Amazon Cognito",
            zh: "用戶認證服務",
            desc: "為 Web/Mobile App 提供用戶註冊、登錄功能",
            details: [
              "User Pool — 用戶目錄，處理註冊登錄",
              "Identity Pool — 給用戶臨時 AWS 憑證",
              "支持社交登錄（Google, Facebook）",
            ],
          },
          {
            id: "t18",
            term: "AWS Secrets Manager",
            zh: "密鑰管理器",
            desc: "安全存儲和自動輪換密碼、API Key、數據庫憑證",
            details: [
              "自動輪換密碼（如 RDS 數據庫密碼）",
              "比硬編碼在代碼裡安全得多",
            ],
          },
          {
            id: "t19",
            term: "GuardDuty / Macie / Inspector / Detective",
            zh: "威脅檢測四件套",
            desc: "AWS 安全服務全家桶",
            details: [
              "GuardDuty — AI 分析日誌找異常行為（誰在暴力破解？）",
              "Macie — 自動發現 S3 裡的敏感數據（身份證號、信用卡）",
              "Inspector — EC2/容器的漏洞掃描",
              "Detective — 安全事件的調查和溯源",
              "Security Hub — 聚合以上所有安全發現的統一面板",
            ],
          },
          {
            id: "t20",
            term: "VPN vs Direct Connect",
            zh: "VPN vs 專線",
            desc: "兩種連接本地數據中心到 AWS 的方式",
            details: [
              "VPN — 通過公網建加密隧道，快速部署，成本低",
              "Direct Connect (DX) — 物理專線，不走公網，延遲穩定",
              "DX 適合大流量/低延遲需求，但部署要數週到數月",
              "可以 VPN 做 DX 的備份連接",
            ],
          },
          {
            id: "t21",
            term: "AWS PrivateLink",
            zh: "私有鏈接",
            desc: "通過 VPC Endpoint 在 AWS 內部網絡訪問服務，流量不走公網",
            details: [
              "Interface Endpoint — 基於 ENI，大多數服務用這個",
              "Gateway Endpoint — 只有 S3 和 DynamoDB 用",
            ],
          },
        ],
      },
      {
        id: "s1-3",
        title: "1.3 Data Security Controls",
        titleZh: "數據安全控制",
        topics: [
          {
            id: "t22",
            term: "KMS — Key Management Service",
            zh: "密鑰管理服務",
            desc: "管理加密密鑰，加密靜態數據",
            details: [
              "CMK — Customer Master Key 客戶主密鑰",
              "AWS Managed Key（AWS 管理）vs Customer Managed Key（你自己管理）",
              "Key Rotation 密鑰輪換 — 定期更換密鑰",
              "Envelope Encryption 信封加密 — 用 CMK 加密數據密鑰，數據密鑰加密數據",
            ],
          },
          {
            id: "t23",
            term: "S3 SSE — Server-Side Encryption",
            zh: "S3 服務端加密",
            desc: "S3 自動在服務端加密你的數據",
            details: [
              "SSE-S3 — Amazon 管理密鑰（默認）",
              "SSE-KMS — 你用 KMS 管理密鑰（可審計）",
              "SSE-C — 你自己提供密鑰（AWS 不保存）",
            ],
          },
          {
            id: "t24",
            term: "ACM — Certificate Manager",
            zh: "證書管理器",
            desc: "免費的 SSL/TLS 證書，保護傳輸中的數據",
            details: [
              "自動續期，不用手動管理",
              "用於 ELB, CloudFront, API Gateway",
            ],
          },
          {
            id: "t25",
            term: "CloudHSM",
            zh: "硬件安全模塊",
            desc: "專用加密硬件，你完全控制密鑰",
            details: [
              "比 KMS 更高的合規等級（FIPS 140-2 Level 3）",
              "你管理密鑰，AWS 都看不到",
            ],
          },
          {
            id: "t26",
            term: "S3 Object Lock / Versioning",
            zh: "對象鎖定 / 版本控制",
            desc: "保護數據不被意外或惡意刪除修改",
            details: [
              "Versioning — 保留所有版本，誤刪可恢復",
              "Object Lock — WORM 模型（寫一次讀多次），合規用途",
              "Governance Mode vs Compliance Mode",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "d2",
    title: "Domain 2: Design Resilient Architectures",
    titleZh: "設計高可用架構",
    weight: 26,
    color: "#1D9E75",
    sections: [
      {
        id: "s2-1",
        title: "2.1 Scalable & Loosely Coupled",
        titleZh: "可擴展和松耦合",
        topics: [
          {
            id: "t27",
            term: "ALB / NLB / GLB",
            zh: "三種負載均衡器",
            desc: "將流量分發到多個目標",
            details: [
              "ALB — Layer 7 (HTTP/HTTPS)，路徑/主機名路由，適合 Web 和微服務",
              "NLB — Layer 4 (TCP/UDP)，超低延遲百萬並發，適合遊戲和 IoT",
              "GLB — Layer 3，適合第三方安全設備（防火牆、IDS）",
            ],
          },
          {
            id: "t28",
            term: "SQS — Simple Queue Service",
            zh: "簡單隊列服務",
            desc: "消息隊列，實現服務間解耦",
            details: [
              "Standard Queue — 至少一次投遞，可能亂序，吞吐無限",
              "FIFO Queue — 嚴格順序，恰好一次投遞，300 TPS",
              "Dead Letter Queue (DLQ) — 處理失敗的消息放這裡",
              "Visibility Timeout — 消息被讀取後暫時隱藏的時間",
              "Long Polling — 減少空輪詢，省成本",
            ],
          },
          {
            id: "t29",
            term: "SNS — Simple Notification Service",
            zh: "簡單通知服務",
            desc: "發布/訂閱模式，一對多消息推送",
            details: [
              "Pub/Sub 模式 — 發布者發一條，所有訂閱者都收到",
              "Fan-out 扇出 — SNS 觸發多個 SQS 隊列的經典架構",
              "訂閱者可以是 SQS, Lambda, Email, HTTP, SMS",
            ],
          },
          {
            id: "t30",
            term: "Lambda",
            zh: "無服務器函數計算",
            desc: "上傳代碼就能運行，不用管服務器，按調用次數付費",
            details: [
              "Event-driven — 由 S3/SQS/API Gateway/CloudWatch 等觸發",
              "最長運行 15 分鐘",
              "Cold Start 冷啟動 — 首次調用有延遲",
              "Concurrency 並發 — 默認 1000，可申請提高",
              "支持多種語言: Python, Node.js, Java, Go 等",
            ],
          },
          {
            id: "t31",
            term: "Fargate",
            zh: "無服務器容器",
            desc: "運行容器但不用管底層 EC2 實例",
            details: [
              "配合 ECS 或 EKS 使用",
              "按 vCPU 和內存計費",
              "適合不想管理服務器的容器化應用",
            ],
          },
          {
            id: "t32",
            term: "ECS vs EKS",
            zh: "容器編排選擇",
            desc: "兩種容器管理方案",
            details: [
              "ECS — AWS 原生，簡單易用，與 AWS 深度集成",
              "EKS — Kubernetes 託管，適合已有 K8s 經驗或需要跨雲",
              "ECR — 容器鏡像倉庫，存放 Docker 鏡像",
              "Launch Type: EC2（你管 EC2）vs Fargate（AWS 管）",
            ],
          },
          {
            id: "t33",
            term: "API Gateway",
            zh: "API 網關",
            desc: "創建、發布、管理 RESTful 和 WebSocket API",
            details: [
              "常與 Lambda 配合 = 完全無服務器後端",
              "支持請求驗證、流量控制、API Key 管理",
              "可配合 Cognito 做用戶認證",
            ],
          },
          {
            id: "t34",
            term: "Step Functions",
            zh: "步驟函數 — 工作流編排",
            desc: "將多個 AWS 服務組合成可視化的工作流",
            details: [
              "狀態機模式，可視化 JSON 定義",
              "支持分支、並行、重試、錯誤處理",
              "適合複雜的多步驟業務流程",
            ],
          },
          {
            id: "t35",
            term: "EventBridge",
            zh: "事件橋 — 事件總線",
            desc: "事件驅動架構的核心，連接 AWS 服務和 SaaS 應用",
            details: [
              "基於規則路由事件到目標",
              "可調度定時任務（類似 Cron）",
              "替代 CloudWatch Events",
            ],
          },
          {
            id: "t36",
            term: "Architecture Patterns",
            zh: "架構模式",
            desc: "考試常考的設計模式",
            details: [
              "Microservices 微服務 — 小服務獨立部署和擴展",
              "Stateless vs Stateful — 無狀態更易擴展（Session 存 ElastiCache/DynamoDB）",
              "Multi-tier 多層架構 — Web / App / DB 分層",
              "Horizontal Scaling 水平擴展 — 加更多機器",
              "Vertical Scaling 垂直擴展 — 升級單台配置",
            ],
          },
        ],
      },
      {
        id: "s2-2",
        title: "2.2 Highly Available & Fault-Tolerant",
        titleZh: "高可用和容錯",
        topics: [
          {
            id: "t37",
            term: "DR Strategies",
            zh: "災難恢復策略",
            desc: "四種 DR 策略，成本和恢復速度遞增",
            details: [
              "Backup & Restore — 最便宜，RTO/RPO 小時級",
              "Pilot Light 導航燈 — 核心系統最小化運行，需要時擴展",
              "Warm Standby 溫備 — 縮小版完整系統持續運行",
              "Active-Active 雙活 — 最貴，RTO/RPO 秒級",
              "RPO = 能丟多少數據（上次備份到災難之間）",
              "RTO = 能停多久（災難到恢復之間）",
            ],
          },
          {
            id: "t38",
            term: "Route 53",
            zh: "DNS 路由服務",
            desc: "AWS 的 DNS 服務，不只是域名解析",
            details: [
              "Simple Routing — 簡單對應一個 IP",
              "Weighted Routing — 按比例分流量（灰度發布）",
              "Latency-based — 路由到延遲最低的區域",
              "Failover — 主備切換，配合 Health Check",
              "Geolocation — 根據用戶地理位置路由",
              "Health Check — 持續監測端點是否正常",
            ],
          },
          {
            id: "t39",
            term: "Auto Scaling",
            zh: "自動伸縮",
            desc: "根據負載自動增減 EC2 實例",
            details: [
              "Launch Template 啟動模板 — 定義實例配置",
              "Target Tracking — 保持目標指標（如 CPU 50%）",
              "Step Scaling — 按梯度擴縮",
              "Scheduled — 按時間計劃擴縮",
              "Cooldown Period 冷卻期 — 防止頻繁伸縮",
            ],
          },
          {
            id: "t40",
            term: "CloudWatch / CloudTrail / Config",
            zh: "監控三件套",
            desc: "監控、審計、合規的核心服務",
            details: [
              "CloudWatch — 指標監控 + 告警 + 日誌收集",
              "CloudTrail — 記錄所有 API 調用（誰在什麼時候做了什麼）",
              "AWS Config — 記錄資源配置變更歷史，合規審計",
              "X-Ray — 分佈式應用追蹤，定位性能瓶頸",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "d3",
    title: "Domain 3: Design High-Performing Architectures",
    titleZh: "設計高性能架構",
    weight: 24,
    color: "#378ADD",
    sections: [
      {
        id: "s3-1",
        title: "3.1 Storage Solutions",
        titleZh: "存儲方案",
        topics: [
          {
            id: "t41",
            term: "S3 Storage Classes",
            zh: "S3 存儲類別",
            desc: "按訪問頻率選擇不同層級，成本遞減",
            details: [
              "Standard — 頻繁訪問，最高可用性",
              "Standard-IA — 不頻繁訪問，存取費低，取回有費用",
              "One Zone-IA — 單 AZ，更便宜但可用性低",
              "Intelligent-Tiering — 自動在層級間切換",
              "Glacier Instant — 毫秒取回的歸檔",
              "Glacier Flexible — 分鐘到小時取回",
              "Glacier Deep Archive — 12 小時取回，最便宜",
            ],
          },
          {
            id: "t42",
            term: "S3 vs EBS vs EFS",
            zh: "三種存儲的區別",
            desc: "對象存儲 vs 塊存儲 vs 文件存儲",
            details: [
              "S3 — 對象存儲，HTTP 訪問，無限擴展，適合靜態文件/備份/數據湖",
              "EBS — 塊存儲（虛擬硬盤），綁定單個 EC2，適合數據庫/OS",
              "EFS — 文件存儲 (NFS)，多個 EC2 同時掛載，自動擴縮",
              "FSx for Windows — SMB 協議，Windows 環境用",
              "FSx for Lustre — HPC 高性能計算用",
            ],
          },
          {
            id: "t43",
            term: "EBS Volume Types",
            zh: "EBS 卷類型",
            desc: "四種 EBS 卷，按性能和成本選擇",
            details: [
              "gp3/gp2 — 通用 SSD，大多數場景",
              "io2/io1 — 預置 IOPS SSD，高性能數據庫",
              "st1 — 吞吐優化 HDD，大數據/日誌處理",
              "sc1 — 冷存儲 HDD，最便宜，不頻繁訪問",
              "gp3 比 gp2 便宜 20%，且可獨立設置 IOPS",
            ],
          },
          {
            id: "t44",
            term: "Storage Gateway",
            zh: "存儲網關 — 混合雲存儲",
            desc: "本地數據中心無縫連接 AWS 存儲",
            details: [
              "File Gateway — NFS/SMB 接口到 S3",
              "Volume Gateway — iSCSI 塊存儲，快照到 S3",
              "Tape Gateway — 替代物理磁帶庫",
            ],
          },
        ],
      },
      {
        id: "s3-2",
        title: "3.2 Compute Solutions",
        titleZh: "計算方案",
        topics: [
          {
            id: "t45",
            term: "EC2 Instance Families",
            zh: "EC2 實例類型家族",
            desc: "不同工作負載選不同類型",
            details: [
              "General Purpose (T3, M5) — 均衡，Web 服務器",
              "Compute Optimized (C5) — 高 CPU，批處理/ML 推理",
              "Memory Optimized (R5, X1) — 大內存，內存數據庫",
              "Storage Optimized (I3, D2) — 高 IO，數據倉庫",
              "Accelerated (P3, G4) — GPU，機器學習/視頻編碼",
              "記憶法: 字母代含義 — C=Compute, R=RAM, I=IO, G=GPU",
            ],
          },
          {
            id: "t46",
            term: "AWS Batch / EMR",
            zh: "批處理和大數據",
            desc: "大規模計算任務的託管服務",
            details: [
              "Batch — 批處理作業調度，自動管理 EC2/Fargate 資源",
              "EMR — 託管 Spark/Hadoop，大數據分析和處理",
              "Elastic Beanstalk — PaaS 快速部署 Web 應用（上傳代碼即可）",
            ],
          },
        ],
      },
      {
        id: "s3-3",
        title: "3.3 Database Solutions",
        titleZh: "數據庫方案",
        topics: [
          {
            id: "t47",
            term: "RDS — Relational Database Service",
            zh: "關係數據庫服務",
            desc: "託管的 SQL 數據庫",
            details: [
              "支持 MySQL / PostgreSQL / MariaDB / Oracle / SQL Server",
              "Multi-AZ — 主備自動故障轉移（同步複製，高可用）",
              "Read Replica — 異步複製，分擔讀壓力，可跨 Region",
              "Multi-AZ 是為了高可用，Read Replica 是為了性能",
              "自動備份 + 手動快照",
            ],
          },
          {
            id: "t48",
            term: "Aurora",
            zh: "極光 — AWS 自研關係數據庫",
            desc: "兼容 MySQL/PostgreSQL，性能是 MySQL 的 5 倍",
            details: [
              "6 副本跨 3 AZ，自動修復，極高可用",
              "Aurora Serverless — 自動伸縮，按使用量付費",
              "Aurora Global Database — 跨 Region 低延遲讀（<1秒）",
              "存儲自動擴展，最大 128TB",
            ],
          },
          {
            id: "t49",
            term: "DynamoDB",
            zh: "Key-Value / Document 數據庫",
            desc: "完全託管的 NoSQL，毫秒級延遲",
            details: [
              "On-Demand Mode — 按讀寫次數付費，流量不可預測時用",
              "Provisioned Mode — 預設讀寫容量，穩定流量用",
              "DynamoDB Streams — 變更數據捕獲 (CDC)",
              "DAX — 微秒級緩存加速器，放在 DynamoDB 前面",
              "Global Tables — 多 Region 讀寫，全球部署",
            ],
          },
          {
            id: "t50",
            term: "ElastiCache",
            zh: "彈性緩存",
            desc: "託管的內存數據庫 / 緩存",
            details: [
              "Redis — 持久化、集群、排行榜、Session 存儲",
              "Memcached — 簡單緩存，多線程，沒有持久化",
              "用途: 緩存數據庫查詢結果，減少 DB 讀取壓力",
            ],
          },
          {
            id: "t51",
            term: "Special Purpose Databases",
            zh: "特殊用途數據庫",
            desc: "針對特定場景的數據庫",
            details: [
              "Redshift — 數據倉庫 (OLAP)，PB 級分析",
              "Neptune — 圖數據庫，社交網絡/推薦引擎",
              "Timestream — 時序數據庫，IoT 傳感器數據",
              "QLDB — 不可變賬本，金融交易審計",
              "DocumentDB — MongoDB 兼容",
              "Keyspaces — Cassandra 兼容",
            ],
          },
        ],
      },
      {
        id: "s3-4",
        title: "3.4 Network Architecture",
        titleZh: "網絡架構",
        topics: [
          {
            id: "t52",
            term: "CloudFront vs Global Accelerator",
            zh: "CDN vs 全球加速器",
            desc: "兩種不同的加速方案",
            details: [
              "CloudFront — CDN，緩存靜態/動態內容在邊緣節點",
              "Global Accelerator — Anycast IP，不是緩存而是優化網絡路徑",
              "CloudFront 適合 HTTP 內容分發",
              "Global Accelerator 適合非 HTTP (TCP/UDP)，如遊戲、VoIP",
              "OAC/OAI — 限制 S3 只能通過 CloudFront 訪問",
            ],
          },
          {
            id: "t53",
            term: "VPC Peering vs Transit Gateway",
            zh: "VPC 連接方案",
            desc: "VPC 之間的網絡連接",
            details: [
              "VPC Peering — 兩個 VPC 一對一直連，不可傳遞",
              "Transit Gateway — 中心化樞紐，連接多個 VPC 和 VPN",
              "VPC 少時用 Peering，VPC 多時用 Transit Gateway",
            ],
          },
          {
            id: "t54",
            term: "VPC Endpoint",
            zh: "VPC 端點",
            desc: "在 VPC 內部私有訪問 AWS 服務，流量不出 AWS 網絡",
            details: [
              "Interface Endpoint — 基於 ENI，大多數服務",
              "Gateway Endpoint — 免費，只有 S3 和 DynamoDB",
              "用 VPC Endpoint 可以省 NAT Gateway 的費用",
            ],
          },
        ],
      },
      {
        id: "s3-5",
        title: "3.5 Data Ingestion & Transformation",
        titleZh: "數據攝取與轉換",
        topics: [
          {
            id: "t55",
            term: "Kinesis Family",
            zh: "Kinesis 流數據家族",
            desc: "實時數據流處理",
            details: [
              "Data Streams — 實時數據流，需自定義消費者",
              "Data Firehose — 自動加載到 S3/Redshift/OpenSearch",
              "Data Analytics — 用 SQL 實時分析流數據",
              "Streams vs Firehose: Streams 更靈活但要自己管消費者",
            ],
          },
          {
            id: "t56",
            term: "AWS Glue",
            zh: "無服務器 ETL",
            desc: "數據的抽取-轉換-加載 + 數據目錄",
            details: [
              "Glue Data Catalog — 中央元數據存儲，Athena/Redshift 都用它",
              "Glue Crawlers — 自動掃描和發現數據結構",
              "Glue Jobs — ETL 轉換任務（PySpark）",
            ],
          },
          {
            id: "t57",
            term: "Athena / Redshift / OpenSearch / QuickSight",
            zh: "分析與查詢服務",
            desc: "不同的數據分析場景",
            details: [
              "Athena — 用 SQL 直接查 S3 數據（無需加載，按掃描量付費）",
              "Redshift — PB 級數據倉庫，複雜 OLAP 查詢",
              "OpenSearch — 全文搜索 + 日誌分析（ELK 替代）",
              "QuickSight — BI 可視化儀表板",
              "Lake Formation — 構建和管理安全的數據湖",
            ],
          },
          {
            id: "t58",
            term: "Data Transfer Services",
            zh: "數據傳輸服務",
            desc: "把大量數據搬到 AWS",
            details: [
              "DataSync — 在線快速遷移（本地→AWS，AWS→AWS）",
              "Snow Family — 物理設備搬大數據",
              "Snowcone 8TB / Snowball Edge 80TB / Snowmobile 100PB 卡車",
              "Transfer Family — 託管 SFTP/FTPS/FTP 到 S3",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "d4",
    title: "Domain 4: Design Cost-Optimized Architectures",
    titleZh: "設計成本優化架構",
    weight: 20,
    color: "#BA7517",
    sections: [
      {
        id: "s4-1",
        title: "4.1-4.2 Storage & Compute Cost",
        titleZh: "存儲與計算成本",
        topics: [
          {
            id: "t59",
            term: "S3 Lifecycle Policies",
            zh: "S3 生命週期策略",
            desc: "自動將數據遷移到更便宜的存儲層",
            details: [
              "Transition — 自動移到更便宜的層",
              "Expiration — 自動刪除過期數據",
              "典型: Standard → IA (30天) → Glacier (90天) → 刪除 (365天)",
              "S3 Intelligent-Tiering — 不確定訪問頻率時自動分層",
            ],
          },
          {
            id: "t60",
            term: "EC2 Pricing Models",
            zh: "EC2 定價模型",
            desc: "五種購買方式，成本差異巨大",
            details: [
              "On-Demand 按需 — 最貴最靈活，按秒計費",
              "Reserved Instances (RI) — 1/3年承諾，省最多72%",
              "  Standard RI — 省最多，不能換實例類型",
              "  Convertible RI — 可換類型，省少些",
              "Savings Plans — 承諾 $/hr 用量，比 RI 更靈活",
              "Spot Instances 競價 — 省最多90%，但隨時可能被回收",
              "  適合: 批處理、大數據、CI/CD、可中斷任務",
              "  不適合: 數據庫、關鍵業務",
              "Dedicated Hosts — 專用物理主機，合規/許可證需求",
            ],
          },
          {
            id: "t61",
            term: "Right Sizing & Optimization",
            zh: "合理選型與優化",
            desc: "避免為未使用的資源付費",
            details: [
              "Compute Optimizer — 根據歷史用量推薦實例類型",
              "Trusted Advisor — 識別低利用率實例",
              "Auto Scaling — 按需擴縮，避免過度配置",
              "EC2 Hibernate 休眠 — 暫停計費但保留 RAM 狀態",
              "Lambda / Fargate — 無服務器，不用時不花錢",
            ],
          },
        ],
      },
      {
        id: "s4-2",
        title: "4.3-4.4 Database & Network Cost",
        titleZh: "數據庫與網絡成本",
        topics: [
          {
            id: "t62",
            term: "Database Cost Optimization",
            zh: "數據庫成本優化",
            desc: "選對數據庫類型和計費模式",
            details: [
              "Aurora Serverless — 開發/測試環境自動伸縮省錢",
              "DynamoDB On-Demand — 流量不可預測時按請求付費",
              "RDS Reserved Instances — 穩定負載用 RI 省錢",
              "ElastiCache 緩存 — 減少數據庫讀取次數",
              "Read Replica 比 Multi-AZ 便宜（但不提供高可用）",
            ],
          },
          {
            id: "t63",
            term: "Data Transfer Costs",
            zh: "數據傳輸費用",
            desc: "AWS 網絡傳輸的隱藏成本",
            details: [
              "Inbound 入站 — 免費",
              "Outbound 出站到 Internet — 收費",
              "同 AZ 內用私有 IP — 免費",
              "跨 AZ — 收費（但為了高可用必須跨）",
              "跨 Region — 更貴",
              "VPC Endpoint — 避免走 NAT Gateway 省數據處理費",
              "CloudFront — 從邊緣返回內容比從源站便宜",
            ],
          },
          {
            id: "t64",
            term: "Cost Management Tools",
            zh: "成本管理工具",
            desc: "監控和控制 AWS 花費",
            details: [
              "Cost Explorer — 可視化分析費用趨勢，預測未來",
              "AWS Budgets — 設置預算，超額發告警",
              "Cost and Usage Report (CUR) — 最詳細的費用明細",
              "Cost Allocation Tags — 按項目/部門/環境標記和追蹤費用",
              "Organizations — 合併計費，用量聚合享受批量折扣",
            ],
          },
        ],
      },
    ],
  },
];

const CrossCutting = [
  {
    id: "cc1",
    term: "CloudFormation",
    zh: "IaC 基礎設施即代碼",
    desc: "用 JSON/YAML 模板定義和部署 AWS 資源",
  },
  {
    id: "cc2",
    term: "Systems Manager (SSM)",
    zh: "系統管理器",
    desc: "補丁管理、參數存儲 (Parameter Store)、遠程命令",
  },
  {
    id: "cc3",
    term: "DMS — Database Migration Service",
    zh: "數據庫遷移服務",
    desc: "同構遷移（相同引擎）和異構遷移（不同引擎，需 SCT 轉換）",
  },
  {
    id: "cc4",
    term: "Well-Architected Framework",
    zh: "架構完善框架",
    desc: "六大支柱: 安全、可靠、性能、成本、運營、可持續",
  },
];

function TopicCard({ topic, mastered, onToggle, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderRadius: 10,
        border: mastered
          ? `1.5px solid ${color}`
          : "1px solid var(--color-border-tertiary)",
        background: mastered
          ? `${color}08`
          : "var(--color-background-primary)",
        padding: "14px 16px",
        transition: "all .2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(topic.id);
          }}
          style={{
            width: 20,
            height: 20,
            minWidth: 20,
            borderRadius: 5,
            border: mastered
              ? `2px solid ${color}`
              : "1.5px solid var(--color-border-secondary)",
            background: mastered ? color : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 2,
            transition: "all .15s",
          }}
        >
          {mastered && (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path
                d="M2.5 6L5 8.5L9.5 3.5"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--color-text-primary)",
              lineHeight: 1.4,
            }}
          >
            {topic.term}
          </div>
          <div
            style={{
              fontSize: 13,
              color: color,
              fontWeight: 500,
              marginTop: 1,
            }}
          >
            {topic.zh}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            {topic.desc}
          </div>
        </div>
        {topic.details && topic.details.length > 0 && (
          <span
            style={{
              fontSize: 11,
              color: "var(--color-text-tertiary)",
              marginTop: 3,
              transition: "transform .2s",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            ▶
          </span>
        )}
      </div>
      {open && topic.details && topic.details.length > 0 && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            paddingLeft: 30,
            borderTop: "1px solid var(--color-border-tertiary)",
          }}
        >
          {topic.details.map((d, i) => (
            <div
              key={i}
              style={{
                fontSize: 13,
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
                padding: "3px 0",
                paddingLeft: d.startsWith("  ") ? 16 : 0,
              }}
            >
              <span style={{ color: color, marginRight: 6, fontSize: 8 }}>
                ●
              </span>
              {d.trim()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [search, setSearch] = useState("");
  const [activeDomain, setActiveDomain] = useState(null);
  const [mastered, setMastered] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("aws-saa-mastered");
        if (r && r.value) setMastered(JSON.parse(r.value));
      } catch {}
    })();
  }, []);

  const saveMastered = useCallback(
    async (next) => {
      setMastered(next);
      try {
        await window.storage.set("aws-saa-mastered", JSON.stringify(next));
      } catch {}
    },
    []
  );

  const toggleMastered = useCallback(
    (id) => {
      const next = { ...mastered, [id]: !mastered[id] };
      saveMastered(next);
    },
    [mastered, saveMastered]
  );

  const toggleSection = (id) =>
    setExpandedSections((p) => ({ ...p, [id]: !p[id] }));

  const allTopics = useMemo(() => {
    const arr = [];
    DOMAINS.forEach((d) =>
      d.sections.forEach((s) => s.topics.forEach((t) => arr.push(t)))
    );
    return arr;
  }, []);

  const totalTopics = allTopics.length;
  const masteredCount = allTopics.filter((t) => mastered[t.id]).length;
  const pct = totalTopics > 0 ? Math.round((masteredCount / totalTopics) * 100) : 0;

  const filteredDomains = useMemo(() => {
    if (!search.trim()) return DOMAINS;
    const q = search.toLowerCase();
    return DOMAINS.map((d) => ({
      ...d,
      sections: d.sections
        .map((s) => ({
          ...s,
          topics: s.topics.filter(
            (t) =>
              t.term.toLowerCase().includes(q) ||
              t.zh.includes(q) ||
              t.desc.includes(q) ||
              (t.details && t.details.some((dd) => dd.toLowerCase().includes(q)))
          ),
        }))
        .filter((s) => s.topics.length > 0),
    })).filter((d) => d.sections.length > 0);
  }, [search]);

  const displayDomains =
    activeDomain != null
      ? filteredDomains.filter((d) => d.id === activeDomain)
      : filteredDomains;

  return (
    <div style={{ padding: "1rem 0", maxWidth: 720, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.3px",
          }}
        >
          AWS SAA-C03
        </span>
        <span
          style={{ fontSize: 14, color: "var(--color-text-secondary)" }}
        >
          知識庫
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            background: "var(--color-background-secondary)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 3,
              background:
                pct === 100
                  ? "#1D9E75"
                  : "linear-gradient(90deg, #7F77DD, #378ADD)",
              transition: "width .3s",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            minWidth: 80,
            textAlign: "right",
          }}
        >
          {masteredCount}/{totalTopics} 已掌握
        </span>
      </div>

      <input
        type="text"
        placeholder="搜索概念、服務名、縮寫..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          fontSize: 14,
          borderRadius: 10,
          border: "1px solid var(--color-border-tertiary)",
          background: "var(--color-background-secondary)",
          color: "var(--color-text-primary)",
          outline: "none",
          marginBottom: 14,
          boxSizing: "border-box",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setActiveDomain(null)}
          style={{
            padding: "5px 12px",
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 7,
            border:
              activeDomain === null
                ? "1.5px solid var(--color-text-primary)"
                : "1px solid var(--color-border-tertiary)",
            background:
              activeDomain === null
                ? "var(--color-text-primary)"
                : "transparent",
            color:
              activeDomain === null
                ? "var(--color-background-primary)"
                : "var(--color-text-secondary)",
            cursor: "pointer",
          }}
        >
          全部
        </button>
        {DOMAINS.map((d) => {
          const active = activeDomain === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setActiveDomain(active ? null : d.id)}
              style={{
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 7,
                border: active
                  ? `1.5px solid ${d.color}`
                  : "1px solid var(--color-border-tertiary)",
                background: active ? `${d.color}18` : "transparent",
                color: active ? d.color : "var(--color-text-secondary)",
                cursor: "pointer",
              }}
            >
              {d.titleZh} {d.weight}%
            </button>
          );
        })}
      </div>

      {displayDomains.map((domain) => (
        <div key={domain.id} style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: domain.color,
              marginBottom: 4,
            }}
          >
            {domain.title}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              marginBottom: 12,
            }}
          >
            {domain.titleZh} — 佔考試 {domain.weight}%
          </div>

          {domain.sections.map((section) => {
            const isExpanded =
              search.trim() !== "" || expandedSections[section.id];
            const secMastered = section.topics.filter(
              (t) => mastered[t.id]
            ).length;
            return (
              <div
                key={section.id}
                style={{
                  marginBottom: 12,
                  border: "1px solid var(--color-border-tertiary)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <div
                  onClick={() => toggleSection(section.id)}
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--color-background-secondary)",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {section.title}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-secondary)",
                        marginLeft: 8,
                      }}
                    >
                      {section.titleZh}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        color:
                          secMastered === section.topics.length
                            ? "#1D9E75"
                            : "var(--color-text-tertiary)",
                        fontWeight: 500,
                      }}
                    >
                      {secMastered}/{section.topics.length}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--color-text-tertiary)",
                        transform: isExpanded
                          ? "rotate(90deg)"
                          : "rotate(0deg)",
                        transition: "transform .15s",
                      }}
                    >
                      ▶
                    </span>
                  </div>
                </div>
                {isExpanded && (
                  <div
                    style={{
                      padding: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {section.topics.map((t) => (
                      <TopicCard
                        key={t.id}
                        topic={t}
                        mastered={!!mastered[t.id]}
                        onToggle={toggleMastered}
                        color={domain.color}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div style={{ marginTop: 8, marginBottom: 20 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            marginBottom: 10,
          }}
        >
          Cross-cutting services (貫穿全域)
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: 6 }}
        >
          {CrossCutting.filter(
            (c) =>
              !search.trim() ||
              c.term.toLowerCase().includes(search.toLowerCase()) ||
              c.zh.includes(search) ||
              c.desc.includes(search)
          ).map((c) => (
            <div
              key={c.id}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid var(--color-border-tertiary)",
                fontSize: 13,
              }}
            >
              <span
                style={{
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                }}
              >
                {c.term}
              </span>
              <span style={{ color: "#888", margin: "0 6px" }}>—</span>
              <span style={{ color: "var(--color-text-secondary)" }}>
                {c.zh}
              </span>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--color-text-tertiary)",
                  marginTop: 3,
                }}
              >
                {c.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
