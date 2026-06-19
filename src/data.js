export const navItems = [
  { id: "tasks", label: "Задачи", path: "/app/tasks" },
  { id: "contracts", label: "Договоры", path: "/app/contracts" },
  { id: "collaterals", label: "Залоги", path: "/app/collaterals" },
  { id: "reports", label: "Отчеты", path: "/app/reports" },
  { id: "mobileEmployee", label: "Мобильный осмотр", path: "/mobile/employee/tasks" },
  { id: "mobileClient", label: "Запрос Банка", path: "/mobile/client/request" }
];

export const roles = [
  {
    id: "specialist",
    label: "Специалист",
    user: "Нодира Каримова",
    department: "Залоговое подразделение",
    menu: ["tasks", "contracts", "collaterals"],
    permissions: {
      createTask: true,
      editCollateral: true,
      completeTask: true,
      returnTask: true,
      reassign: false,
      reports: false,
      admin: false,
      print: true
    }
  },
  {
    id: "manager",
    label: "Руководитель",
    user: "Азиз Рахимов",
    department: "Управление залогов",
    menu: ["tasks", "contracts", "collaterals", "reports"],
    permissions: {
      createTask: true,
      editCollateral: false,
      completeTask: false,
      returnTask: true,
      reassign: true,
      reports: true,
      admin: false,
      print: true
    }
  },
  {
    id: "field",
    label: "Выездной сотрудник",
    user: "Бахтиер Салиев",
    department: "Выездные осмотры",
    menu: ["mobileEmployee"],
    permissions: {
      createTask: false,
      editCollateral: false,
      completeTask: true,
      returnTask: false,
      reassign: false,
      reports: false,
      admin: false,
      print: false
    }
  },
  {
    id: "client",
    label: "Клиент",
    user: "ООО Samarkand Logistic",
    department: "Клиентский доступ",
    menu: ["mobileClient"],
    permissions: {
      createTask: false,
      editCollateral: false,
      completeTask: false,
      returnTask: false,
      reassign: false,
      reports: false,
      admin: false,
      print: false
    }
  },
  {
    id: "admin",
    label: "Администратор/методолог",
    user: "Малика Абдуллаева",
    department: "Методология и ИТ",
    menu: ["tasks", "contracts", "collaterals"],
    permissions: {
      createTask: false,
      editCollateral: false,
      completeTask: false,
      returnTask: false,
      reassign: true,
      reports: false,
      admin: true,
      print: false
    }
  }
];

export const employees = [
  "Нодира Каримова",
  "Фарход Усманов",
  "Дилшод Мирзаев",
  "Мадина Юсупова",
  "Бахтиер Салиев",
  "Шахноза Турсунова"
];

export const taskTypes = [
  "Первичный осмотр",
  "Повторный осмотр",
  "Выездной осмотр",
  "Клиентский осмотр",
  "Единичная переоценка",
  "Плановый мониторинг",
  "Внеплановый мониторинг",
  "Постановка в залог",
  "Снятие обременения",
  "Замена залога"
];

export const riskNames = [
  "Истечение страховки",
  "Окончание срока оценки",
  "Падение стоимости",
  "Ухудшение LTV",
  "Статус имущества",
  "Судебные ограничения",
  "Двойной залог",
  "Арест имущества"
];

const risks = (levels) =>
  riskNames.map((name, index) => ({
    name,
    level: levels[index] || "ok",
    source:
      levels[index] === "critical"
        ? "Госисточник РУз"
        : levels[index] === "warn"
          ? "Регламентный контроль"
          : "Проверка без замечаний"
  }));

export const initialData = {
  contracts: [
    {
      id: "CTR-2026-0148",
      number: "KM-26/148",
      startDate: "2025-11-18",
      endDate: "2028-11-18",
      product: "Кредитная линия для оборотного капитала",
      currency: "UZS",
      limit: 3800000000,
      debt: 2520000000,
      marketValue: 5200000000,
      allocatedValue: 3600000000,
      ltv: 70,
      coverageStatus: "Полное",
      status: "Активен",
      loanQuality: "2 класс",
      reserve: 126000000,
      clientType: "ЮЛ",
      clientName: "OOO Orient Textile Group",
      inn: "304 882 110",
      gsz: "ГСЗ Orient Textile",
      collateralIds: ["COL-001", "COL-004"],
      participants: [
        { role: "Заемщик", name: "OOO Orient Textile Group", idn: "304 882 110", share: "100%", contact: "Финансовый директор подтвержден" },
        { role: "Залогодатель", name: "OOO Orient Warehouse", idn: "304 912 776", share: "Долевой объект", contact: "Контакт актуален" }
      ]
    },
    {
      id: "CTR-2026-0192",
      number: "AV-26/192",
      startDate: "2026-01-12",
      endDate: "2029-01-12",
      product: "Автокредит для корпоративного парка",
      currency: "UZS",
      limit: 1650000000,
      debt: 1380000000,
      marketValue: 1760000000,
      allocatedValue: 1410000000,
      ltv: 98,
      coverageStatus: "Частичное",
      status: "Активен",
      loanQuality: "3 класс",
      reserve: 207000000,
      clientType: "ЮЛ",
      clientName: "OOO Samarkand Logistic",
      inn: "309 441 009",
      gsz: "ГСЗ Samarkand Logistic",
      collateralIds: ["COL-002", "COL-006"],
      participants: [
        { role: "Заемщик", name: "OOO Samarkand Logistic", idn: "309 441 009", share: "100%", contact: "Телефон подтвержден" },
        { role: "Поручитель", name: "ИП Нурматов А.А.", idn: "502 178 233", share: "Поручительство", contact: "Требует обновления" }
      ]
    },
    {
      id: "CTR-2025-0771",
      number: "IP-25/771",
      startDate: "2025-04-09",
      endDate: "2030-04-09",
      product: "Ипотечный кредит",
      currency: "UZS",
      limit: 920000000,
      debt: 812000000,
      marketValue: 1040000000,
      allocatedValue: 755000000,
      ltv: 108,
      coverageStatus: "Не обеспечено",
      status: "Активен",
      loanQuality: "4 класс",
      reserve: 324800000,
      clientType: "ФЛ",
      clientName: "Саидова Дилором Хамидовна",
      inn: "410 225 990 114 33",
      gsz: "ГСЗ Саидова",
      collateralIds: ["COL-003"],
      participants: [
        { role: "Заемщик", name: "Саидова Дилором Хамидовна", idn: "410 225 990 114 33", share: "100%", contact: "SMS доступен" },
        { role: "Созаемщик", name: "Саидов Камол Хамидович", idn: "410 331 008 215 11", share: "50%", contact: "Контакт актуален" }
      ]
    },
    {
      id: "CTR-2026-0228",
      number: "BG-26/228",
      startDate: "2026-02-05",
      endDate: "2027-08-05",
      product: "Банковская гарантия",
      currency: "UZS",
      limit: 2400000000,
      debt: 1180000000,
      marketValue: 3600000000,
      allocatedValue: 1720000000,
      ltv: 69,
      coverageStatus: "Полное",
      status: "Активен",
      loanQuality: "1 класс",
      reserve: 23600000,
      clientType: "ЮЛ",
      clientName: "AO Bukhara Agro Export",
      inn: "300 118 454",
      gsz: "ГСЗ Agro Export",
      collateralIds: ["COL-005", "COL-008"],
      participants: [
        { role: "Принципал", name: "AO Bukhara Agro Export", idn: "300 118 454", share: "100%", contact: "Подписант проверен" },
        { role: "Залогодатель", name: "OOO Agro Terminal", idn: "301 771 628", share: "Имущество", contact: "Контакт актуален" }
      ]
    },
    {
      id: "CTR-2026-0316",
      number: "LC-26/316",
      startDate: "2026-03-18",
      endDate: "2027-03-18",
      product: "Кредитная линия на экспортный контракт",
      currency: "UZS",
      limit: 800000000,
      debt: 580000000,
      marketValue: 3600000000,
      allocatedValue: 680000000,
      ltv: 85,
      coverageStatus: "Частичное",
      status: "Активен",
      loanQuality: "2 класс",
      reserve: 46400000,
      clientType: "ЮЛ",
      clientName: "AO Bukhara Agro Export",
      inn: "300 118 454",
      gsz: "ГСЗ Agro Export",
      collateralIds: ["COL-005", "COL-008"],
      participants: [
        { role: "Заемщик", name: "AO Bukhara Agro Export", idn: "300 118 454", share: "100%", contact: "Подписант проверен" },
        { role: "Залогодатель", name: "AO Bukhara Agro Export", idn: "300 118 454", share: "Имущество", contact: "Контакт актуален" }
      ]
    },
    {
      id: "CTR-2024-0644",
      number: "KL-24/644",
      startDate: "2024-09-20",
      endDate: "2027-09-20",
      product: "Кредит на оборудование",
      currency: "USD",
      limit: 470000,
      debt: 344000,
      marketValue: 4950000000,
      allocatedValue: 3710000000,
      ltv: 92,
      coverageStatus: "Частичное",
      status: "Активен",
      loanQuality: "3 класс",
      reserve: 51600000,
      clientType: "ЮЛ",
      clientName: "OOO Tashkent Print Pack",
      inn: "306 002 779",
      gsz: "ГСЗ Print Pack",
      collateralIds: ["COL-007"],
      participants: [
        { role: "Заемщик", name: "OOO Tashkent Print Pack", idn: "306 002 779", share: "100%", contact: "Email подтвержден" }
      ]
    }
  ],
  collaterals: [
    {
      id: "COL-001",
      type: "Недвижимость",
      description: "Складской комплекс 4 200 кв.м, Ташкентская область",
      clientName: "OOO Orient Warehouse",
      clientId: "304 912 776",
      clientType: "ЮЛ",
      gsz: "ГСЗ Orient Textile",
      region: "Ташкентская область",
      address: "Зангиатинский район, промзона Северная, участок 18",
      contractIds: ["CTR-2026-0148"],
      marketValue: 4200000000,
      pledgeValue: 3360000000,
      allocatedValue: 2900000000,
      appraisalStatus: "Действует",
      appraisalDue: "2026-09-20",
      insuranceStatus: "Оплачена",
      insuranceDue: "2026-12-31",
      status: "В залоге",
      crossPledge: false,
      responsible: "Нодира Каримова",
      updatedAt: "2026-06-14 10:30",
      source: "АБС",
      riskScore: 18,
      riskState: "Хорошее",
      risks: risks(["ok", "warn", "ok", "ok", "ok", "ok", "ok", "ok"]),
      fields: {
        "Кадастровый номер": "10:04:01:02:0031",
        "Назначение": "Склад и офис",
        "Площадь земли": "1.8 га",
        "Площадь строений": "4 200 кв.м",
        "Год ввода": "2018",
        "Материал стен": "Металлоконструкции, сэндвич-панели",
        "Состояние": "Эксплуатируется",
        "Признак изменения": "Нет изменений после проверки"
      },
      monitoring: {
        lastInspection: "2026-05-21",
        inspector: "Фарход Усманов",
        condition: "Удовлетворительное",
        nextInspection: "2026-08-21",
        periodicity: "Ежеквартально",
        completed: true,
        schedule: [
          { date: "2026-02-21", type: "Плановый", result: "Без замечаний", inspector: "Фарход Усманов", status: "Завершен" },
          { date: "2026-05-21", type: "Плановый", result: "Требуется обновить фото фасада", inspector: "Фарход Усманов", status: "Завершен" },
          { date: "2026-08-21", type: "Плановый", result: "Ожидается", inspector: "Не назначен", status: "Запланирован" }
        ]
      },
      evaluations: [
        { date: "2026-03-20", appraiser: "OOO Fair Value", market: 4200000000, pledge: 3360000000, method: "Доходный и сравнительный", status: "Действует" },
        { date: "2025-03-18", appraiser: "OOO Fair Value", market: 4050000000, pledge: 3240000000, method: "Сравнительный", status: "Архив" }
      ],
      insurance: {
        company: "KAFOLAT Sugurta",
        policy: "KS-26-000184",
        from: "2026-01-01",
        to: "2026-12-31",
        amount: 3360000000,
        premiumStatus: "Оплачена",
        source: "Конвейер"
      },
      encumbrances: [
        { number: "ZL-26/148-1", date: "2026-01-24", type: "Ипотека", amount: 2900000000, contract: "KM-26/148", allocated: 2900000000, ltv: 70, status: "Зарегистрировано" }
      ],
      pledgors: [
        { share: "100%", name: "OOO Orient Warehouse", idn: "304 912 776", role: "Залогодатель", check: "Проверен" }
      ],
      externalData: {
        "Источник": "Кадастровое агентство РУз",
        "Дата проверки": "2026-06-14 09:20",
        "Право собственности": "Подтверждено",
        "Аресты": "Не выявлены",
        "Запреты": "Не выявлены",
        "Внешний залоговый реестр": "Запись активна"
      },
      documents: [
        { name: "Кадастровая выписка.pdf", type: "Право", required: true, status: "Получен из архива", date: "2026-06-10" },
        { name: "Отчет оценки FV-183.pdf", type: "Оценка", required: true, status: "Подписан", date: "2026-03-20" },
        { name: "Полис KS-26-000184.pdf", type: "Страхование", required: true, status: "Получен из конвейера", date: "2026-01-02" }
      ],
      history: [
        { date: "2026-06-14 10:30", user: "Система", field: "Внешние данные", oldValue: "Проверка от 2026-05-14", newValue: "Проверка от 2026-06-14", reason: "Ежемесячный регламент", source: "Кадастр" },
        { date: "2026-05-21 16:18", user: "Фарход Усманов", field: "Осмотр", oldValue: "Запланирован", newValue: "Завершен", reason: "Плановый мониторинг", source: "Мобильный АРМ" }
      ]
    },
    {
      id: "COL-002",
      type: "Автотранспорт",
      description: "Mercedes-Benz Actros 1845, 2022 г., гос. номер 30 A 884 CB",
      clientName: "OOO Samarkand Logistic",
      clientId: "309 441 009",
      clientType: "ЮЛ",
      gsz: "ГСЗ Samarkand Logistic",
      region: "Самарканд",
      address: "Самарканд, ул. Навои, автопарк 12",
      contractIds: ["CTR-2026-0192"],
      marketValue: 980000000,
      pledgeValue: 784000000,
      allocatedValue: 760000000,
      appraisalStatus: "Истекает",
      appraisalDue: "2026-07-05",
      insuranceStatus: "Истекает",
      insuranceDue: "2026-06-28",
      status: "В залоге",
      crossPledge: false,
      responsible: "Мадина Юсупова",
      updatedAt: "2026-06-15 15:45",
      source: "Конвейер",
      riskScore: 54,
      riskState: "Требует внимания",
      risks: risks(["critical", "warn", "ok", "warn", "ok", "ok", "ok", "ok"]),
      fields: {
        "VIN": "W1K9634031L978401",
        "Госномер": "30 A 884 CB",
        "Марка/модель": "Mercedes-Benz Actros 1845",
        "Год выпуска": "2022",
        "Пробег": "148 400 км",
        "Состояние": "Рабочее, требуется фото шин",
        "Место хранения": "Автопарк заемщика"
      },
      monitoring: {
        lastInspection: "2026-04-04",
        inspector: "Бахтиер Салиев",
        condition: "Рабочее",
        nextInspection: "2026-06-20",
        periodicity: "Раз в два месяца",
        completed: false,
        schedule: [
          { date: "2026-04-04", type: "Первичный", result: "Без критических замечаний", inspector: "Бахтиер Салиев", status: "Завершен" },
          { date: "2026-06-20", type: "Повторный", result: "Ожидается", inspector: "Бахтиер Салиев", status: "Назначен" }
        ]
      },
      evaluations: [
        { date: "2026-01-09", appraiser: "Auto Expert Plus", market: 980000000, pledge: 784000000, method: "Сравнительный", status: "Истекает" }
      ],
      insurance: {
        company: "Gross Insurance",
        policy: "GI-AUTO-26-7791",
        from: "2025-06-29",
        to: "2026-06-28",
        amount: 784000000,
        premiumStatus: "Оплачена",
        source: "АБС"
      },
      encumbrances: [
        { number: "ZL-26/192-1", date: "2026-01-19", type: "Залог ТС", amount: 760000000, contract: "AV-26/192", allocated: 760000000, ltv: 91, status: "Зарегистрировано" }
      ],
      pledgors: [
        { share: "100%", name: "OOO Samarkand Logistic", idn: "309 441 009", role: "Залогодатель", check: "Проверен" }
      ],
      externalData: {
        "Источник": "СБДД/ГАИ МВД РУз",
        "Дата проверки": "2026-06-15 14:10",
        "Регистрация ТС": "Активна",
        "Аресты": "Не выявлены",
        "Запрет регистрационных действий": "Не выявлен",
        "Розыск": "Не числится"
      },
      documents: [
        { name: "СТС Actros.pdf", type: "Право", required: true, status: "Получен", date: "2026-01-12" },
        { name: "Полис GI-AUTO-26-7791.pdf", type: "Страхование", required: true, status: "Истекает", date: "2025-06-29" }
      ],
      history: [
        { date: "2026-06-15 15:45", user: "Система", field: "Сигнал риска", oldValue: "Нет", newValue: "Истечение страховки", reason: "Срок менее 15 дней", source: "АБС" }
      ]
    },
    {
      id: "COL-003",
      type: "Недвижимость",
      description: "Квартира 82 кв.м, Ташкент, Мирзо-Улугбекский район",
      clientName: "Саидова Дилором Хамидовна",
      clientId: "410 225 990 114 33",
      clientType: "ФЛ",
      gsz: "ГСЗ Саидова",
      region: "Ташкент",
      address: "Ташкент, Мирзо-Улугбекский район, массив Буюк Ипак Йули, дом 9",
      contractIds: ["CTR-2025-0771"],
      marketValue: 1040000000,
      pledgeValue: 755000000,
      allocatedValue: 755000000,
      appraisalStatus: "Просрочена",
      appraisalDue: "2026-04-15",
      insuranceStatus: "Оплачена",
      insuranceDue: "2027-01-10",
      status: "В залоге",
      crossPledge: false,
      responsible: "Нодира Каримова",
      updatedAt: "2026-06-12 11:05",
      source: "Миграция",
      riskScore: 82,
      riskState: "Критическое",
      risks: risks(["ok", "critical", "warn", "critical", "ok", "critical", "ok", "ok"]),
      fields: {
        "Кадастровый номер": "10:06:04:09:1148",
        "Этаж": "7 из 9",
        "Площадь": "82 кв.м",
        "Комнат": "3",
        "Состояние": "Требуется повторная оценка",
        "Проживание": "Заемщик"
      },
      monitoring: {
        lastInspection: "2025-12-18",
        inspector: "Фарход Усманов",
        condition: "Удовлетворительное",
        nextInspection: "2026-06-18",
        periodicity: "Раз в полгода",
        completed: true,
        schedule: [
          { date: "2025-12-18", type: "Плановый", result: "Без замечаний", inspector: "Фарход Усманов", status: "Завершен" },
          { date: "2026-06-18", type: "Плановый", result: "Ожидается", inspector: "Не назначен", status: "Запланирован" }
        ]
      },
      evaluations: [
        { date: "2025-04-15", appraiser: "Tashkent Appraisal", market: 1040000000, pledge: 755000000, method: "Сравнительный", status: "Просрочена" }
      ],
      insurance: {
        company: "Uzbekinvest",
        policy: "UI-RE-25-8830",
        from: "2026-01-10",
        to: "2027-01-10",
        amount: 755000000,
        premiumStatus: "Оплачена",
        source: "АБС"
      },
      encumbrances: [
        { number: "ZL-25/771-1", date: "2025-04-14", type: "Ипотека", amount: 755000000, contract: "IP-25/771", allocated: 755000000, ltv: 108, status: "Судебный риск" }
      ],
      pledgors: [
        { share: "100%", name: "Саидова Дилором Хамидовна", idn: "410 225 990 114 33", role: "Залогодатель", check: "Требуется проверка" }
      ],
      externalData: {
        "Источник": "Кадастровое агентство РУз",
        "Дата проверки": "2026-06-12 10:54",
        "Право собственности": "Подтверждено",
        "Аресты": "Не выявлены",
        "Судебные ограничения": "Есть спор по коммунальной задолженности",
        "Внешний залоговый реестр": "Запись активна"
      },
      documents: [
        { name: "Выписка кадастра 2025.pdf", type: "Право", required: true, status: "Просит обновления", date: "2025-04-13" },
        { name: "Отчет оценки TA-441.pdf", type: "Оценка", required: true, status: "Просрочен", date: "2025-04-15" }
      ],
      history: [
        { date: "2026-06-12 11:05", user: "Система", field: "Сигнал риска", oldValue: "Предупреждение", newValue: "Критический LTV", reason: "LTV 108%", source: "Алгоритм" }
      ]
    },
    {
      id: "COL-004",
      type: "Товары в обороте",
      description: "Хлопковая пряжа и готовая ткань на складе",
      clientName: "OOO Orient Textile Group",
      clientId: "304 882 110",
      clientType: "ЮЛ",
      gsz: "ГСЗ Orient Textile",
      region: "Ташкентская область",
      address: "Склад готовой продукции, линия B",
      contractIds: ["CTR-2026-0148"],
      marketValue: 1000000000,
      pledgeValue: 700000000,
      allocatedValue: 700000000,
      appraisalStatus: "Действует",
      appraisalDue: "2026-10-01",
      insuranceStatus: "Оплачена",
      insuranceDue: "2026-12-31",
      status: "В залоге",
      crossPledge: false,
      responsible: "Дилшод Мирзаев",
      updatedAt: "2026-06-13 09:12",
      source: "АБС",
      riskScore: 29,
      riskState: "Удовлетворительное",
      risks: risks(["ok", "ok", "warn", "ok", "warn", "ok", "ok", "ok"]),
      fields: {
        "Группа товаров": "Текстильная продукция",
        "Объем": "620 тонн",
        "Место хранения": "Склад готовой продукции",
        "Метод контроля": "Складской акт и фотофиксация",
        "Периодичность сверки": "Ежемесячно"
      },
      monitoring: {
        lastInspection: "2026-06-01",
        inspector: "Дилшод Мирзаев",
        condition: "Частичное движение партии",
        nextInspection: "2026-07-01",
        periodicity: "Ежемесячно",
        completed: true,
        schedule: [
          { date: "2026-06-01", type: "Плановый", result: "Остаток подтвержден", inspector: "Дилшод Мирзаев", status: "Завершен" },
          { date: "2026-07-01", type: "Плановый", result: "Ожидается", inspector: "Не назначен", status: "Запланирован" }
        ]
      },
      evaluations: [
        { date: "2026-05-30", appraiser: "Внутренняя оценка", market: 1000000000, pledge: 700000000, method: "Складская сверка", status: "Действует" }
      ],
      insurance: {
        company: "KAFOLAT Sugurta",
        policy: "KS-STOCK-26-041",
        from: "2026-01-01",
        to: "2026-12-31",
        amount: 700000000,
        premiumStatus: "Оплачена",
        source: "Конвейер"
      },
      encumbrances: [
        { number: "ZL-26/148-2", date: "2026-01-24", type: "Залог товаров", amount: 700000000, contract: "KM-26/148", allocated: 700000000, ltv: 70, status: "Зарегистрировано" }
      ],
      pledgors: [
        { share: "100%", name: "OOO Orient Textile Group", idn: "304 882 110", role: "Залогодатель", check: "Проверен" }
      ],
      externalData: {
        "Источник": "Monitoring/Collection",
        "Дата проверки": "2026-06-13 09:12",
        "Складской остаток": "Подтвержден частично",
        "Статус взыскания": "Нет",
        "Сигнал реализации": "Нет"
      },
      documents: [
        { name: "Складской акт 06-2026.xlsx", type: "Мониторинг", required: true, status: "Загружен", date: "2026-06-01" }
      ],
      history: [
        { date: "2026-06-13 09:12", user: "Система", field: "Остаток партии", oldValue: "680 тонн", newValue: "620 тонн", reason: "Складская сверка", source: "Monitoring" }
      ]
    },
    {
      id: "COL-005",
      type: "Оборудование",
      description: "Линия сортировки и упаковки сухофруктов Unitec",
      clientName: "AO Bukhara Agro Export",
      clientId: "300 118 454",
      clientType: "ЮЛ",
      gsz: "ГСЗ Agro Export",
      region: "Бухара",
      address: "Бухара, промышленная зона Каракуль",
      contractIds: ["CTR-2026-0228", "CTR-2026-0316"],
      marketValue: 2400000000,
      pledgeValue: 1920000000,
      allocatedValue: 1720000000,
      appraisalStatus: "Действует",
      appraisalDue: "2027-02-01",
      insuranceStatus: "Оплачена",
      insuranceDue: "2027-02-01",
      status: "В залоге",
      crossPledge: true,
      responsible: "Шахноза Турсунова",
      updatedAt: "2026-06-10 13:10",
      source: "Конвейер",
      riskScore: 22,
      riskState: "Хорошее",
      risks: risks(["ok", "ok", "ok", "ok", "ok", "ok", "warn", "ok"]),
      fields: {
        "Серийный номер": "UT-DRY-22-901",
        "Производитель": "Unitec",
        "Год выпуска": "2022",
        "Местонахождение": "Производственный цех 2",
        "Техническое состояние": "Рабочее",
        "Право собственности": "Инвойс и акт ввода"
      },
      monitoring: {
        lastInspection: "2026-05-28",
        inspector: "Шахноза Турсунова",
        condition: "Работает",
        nextInspection: "2026-08-28",
        periodicity: "Ежеквартально",
        completed: true,
        schedule: [
          { date: "2026-05-28", type: "Плановый", result: "Оборудование на месте", inspector: "Шахноза Турсунова", status: "Завершен" }
        ]
      },
      evaluations: [
        { date: "2026-02-01", appraiser: "Tech Appraisal", market: 2400000000, pledge: 1920000000, method: "Затратный", status: "Действует" }
      ],
      insurance: {
        company: "Apex Insurance",
        policy: "APX-EQ-26-2910",
        from: "2026-02-01",
        to: "2027-02-01",
        amount: 1920000000,
        premiumStatus: "Оплачена",
        source: "Конвейер"
      },
      encumbrances: [
        { number: "ZL-26/228-1", date: "2026-02-05", type: "Залог оборудования", amount: 1200000000, contract: "BG-26/228", allocated: 1200000000, ltv: 69, status: "Зарегистрировано" },
        { number: "ZL-26/316-1", date: "2026-03-18", type: "Кросс-обременение оборудования", amount: 520000000, contract: "LC-26/316", allocated: 520000000, ltv: 85, status: "Зарегистрировано" }
      ],
      pledgors: [
        { share: "100%", name: "AO Bukhara Agro Export", idn: "300 118 454", role: "Залогодатель", check: "Проверен" }
      ],
      externalData: {
        "Источник": "АБС + архив",
        "Дата проверки": "2026-06-10 13:10",
        "Документы собственности": "Подтверждены",
        "Ограничения": "Не выявлены",
        "Признак двойного залога": "Проверить кросс-связь"
      },
      documents: [
        { name: "Инвойс Unitec.pdf", type: "Право", required: true, status: "Получен из архива", date: "2026-02-01" },
        { name: "Акт ввода оборудования.pdf", type: "Право", required: true, status: "Получен из архива", date: "2026-02-02" }
      ],
      history: [
        { date: "2026-06-10 13:10", user: "Система", field: "Признак кросс-залога", oldValue: "Нет", newValue: "Да", reason: "Связка с обеспечением COL-008", source: "Аллокация" }
      ]
    },
    {
      id: "COL-006",
      type: "Автотранспорт",
      description: "Hyundai HD78, 2021 г., гос. номер 30 B 221 DA",
      clientName: "OOO Samarkand Logistic",
      clientId: "309 441 009",
      clientType: "ЮЛ",
      gsz: "ГСЗ Samarkand Logistic",
      region: "Самарканд",
      address: "Самарканд, ул. Навои, автопарк 12",
      contractIds: ["CTR-2026-0192"],
      marketValue: 780000000,
      pledgeValue: 626000000,
      allocatedValue: 650000000,
      appraisalStatus: "Действует",
      appraisalDue: "2026-11-12",
      insuranceStatus: "Оплачена",
      insuranceDue: "2026-11-12",
      status: "В залоге",
      crossPledge: false,
      responsible: "Мадина Юсупова",
      updatedAt: "2026-06-11 12:22",
      source: "Конвейер",
      riskScore: 32,
      riskState: "Удовлетворительное",
      risks: risks(["ok", "ok", "ok", "warn", "ok", "ok", "ok", "ok"]),
      fields: {
        "VIN": "KMFLA18APMC349121",
        "Госномер": "30 B 221 DA",
        "Марка/модель": "Hyundai HD78",
        "Год выпуска": "2021",
        "Пробег": "92 100 км",
        "Состояние": "Рабочее"
      },
      monitoring: {
        lastInspection: "2026-05-11",
        inspector: "Бахтиер Салиев",
        condition: "Рабочее",
        nextInspection: "2026-07-11",
        periodicity: "Раз в два месяца",
        completed: true,
        schedule: [
          { date: "2026-05-11", type: "Плановый", result: "Без замечаний", inspector: "Бахтиер Салиев", status: "Завершен" }
        ]
      },
      evaluations: [
        { date: "2026-02-12", appraiser: "Auto Expert Plus", market: 780000000, pledge: 626000000, method: "Сравнительный", status: "Действует" }
      ],
      insurance: {
        company: "Gross Insurance",
        policy: "GI-AUTO-26-8011",
        from: "2025-11-12",
        to: "2026-11-12",
        amount: 626000000,
        premiumStatus: "Оплачена",
        source: "АБС"
      },
      encumbrances: [
        { number: "ZL-26/192-2", date: "2026-02-12", type: "Залог ТС", amount: 650000000, contract: "AV-26/192", allocated: 650000000, ltv: 98, status: "Зарегистрировано" }
      ],
      pledgors: [
        { share: "100%", name: "OOO Samarkand Logistic", idn: "309 441 009", role: "Залогодатель", check: "Проверен" }
      ],
      externalData: {
        "Источник": "СБДД/ГАИ МВД РУз",
        "Дата проверки": "2026-06-11 12:22",
        "Регистрация ТС": "Активна",
        "Аресты": "Не выявлены",
        "Запреты": "Не выявлены"
      },
      documents: [
        { name: "СТС Hyundai.pdf", type: "Право", required: true, status: "Получен", date: "2026-02-12" }
      ],
      history: [
        { date: "2026-06-11 12:22", user: "Система", field: "Внешняя проверка", oldValue: "Не выполнялась", newValue: "Без замечаний", reason: "Регламент", source: "СБДД" }
      ]
    },
    {
      id: "COL-007",
      type: "Оборудование",
      description: "Печатная линия Heidelberg Speedmaster XL 106",
      clientName: "OOO Tashkent Print Pack",
      clientId: "306 002 779",
      clientType: "ЮЛ",
      gsz: "ГСЗ Print Pack",
      region: "Ташкент",
      address: "Ташкент, Яшнабадский район, цех 3",
      contractIds: ["CTR-2024-0644"],
      marketValue: 4950000000,
      pledgeValue: 3710000000,
      allocatedValue: 3710000000,
      appraisalStatus: "Действует",
      appraisalDue: "2026-12-04",
      insuranceStatus: "Не оплачена",
      insuranceDue: "2026-07-01",
      status: "В залоге",
      crossPledge: false,
      responsible: "Фарход Усманов",
      updatedAt: "2026-06-09 17:40",
      source: "АБС",
      riskScore: 61,
      riskState: "Требует внимания",
      risks: risks(["critical", "ok", "warn", "warn", "ok", "ok", "ok", "ok"]),
      fields: {
        "Серийный номер": "HDXL106-19-4781",
        "Производитель": "Heidelberg",
        "Год выпуска": "2019",
        "Состояние": "Рабочее",
        "Местонахождение": "Производственный цех 3",
        "Валюта оценки": "UZS"
      },
      monitoring: {
        lastInspection: "2026-05-30",
        inspector: "Фарход Усманов",
        condition: "Работает",
        nextInspection: "2026-08-30",
        periodicity: "Ежеквартально",
        completed: true,
        schedule: [
          { date: "2026-05-30", type: "Плановый", result: "Без замечаний", inspector: "Фарход Усманов", status: "Завершен" }
        ]
      },
      evaluations: [
        { date: "2025-12-04", appraiser: "Tech Appraisal", market: 4950000000, pledge: 3710000000, method: "Затратный", status: "Действует" }
      ],
      insurance: {
        company: "Apex Insurance",
        policy: "APX-EQ-25-712",
        from: "2025-07-01",
        to: "2026-07-01",
        amount: 3710000000,
        premiumStatus: "Ожидает оплату",
        source: "АБС"
      },
      encumbrances: [
        { number: "ZL-24/644-1", date: "2024-09-22", type: "Залог оборудования", amount: 3710000000, contract: "KL-24/644", allocated: 3710000000, ltv: 92, status: "Зарегистрировано" }
      ],
      pledgors: [
        { share: "100%", name: "OOO Tashkent Print Pack", idn: "306 002 779", role: "Залогодатель", check: "Проверен" }
      ],
      externalData: {
        "Источник": "АБС",
        "Дата проверки": "2026-06-09 17:40",
        "Статус страхования": "Премия не оплачена",
        "Статус взыскания": "Нет",
        "Ограничения": "Не выявлены"
      },
      documents: [
        { name: "Отчет оценки Heidelberg.pdf", type: "Оценка", required: true, status: "Подписан", date: "2025-12-04" },
        { name: "Полис APX-EQ-25-712.pdf", type: "Страхование", required: true, status: "Премия не оплачена", date: "2025-07-01" }
      ],
      history: [
        { date: "2026-06-09 17:40", user: "Система", field: "Оплата страховой премии", oldValue: "Оплачена", newValue: "Ожидает оплату", reason: "Сверка АБС", source: "АБС" }
      ]
    },
    {
      id: "COL-008",
      type: "Скот",
      description: "Поголовье КРС мясного направления, 340 голов",
      clientName: "AO Bukhara Agro Export",
      clientId: "300 118 454",
      clientType: "ЮЛ",
      gsz: "ГСЗ Agro Export",
      region: "Бухара",
      address: "Бухарская область, ферма Каракуль",
      contractIds: ["CTR-2026-0228", "CTR-2026-0316"],
      marketValue: 1200000000,
      pledgeValue: 680000000,
      allocatedValue: 680000000,
      appraisalStatus: "Действует",
      appraisalDue: "2026-08-10",
      insuranceStatus: "Оплачена",
      insuranceDue: "2026-12-20",
      status: "В залоге",
      crossPledge: true,
      responsible: "Шахноза Турсунова",
      updatedAt: "2026-06-08 08:52",
      source: "Monitoring",
      riskScore: 45,
      riskState: "Удовлетворительное",
      risks: risks(["ok", "warn", "warn", "ok", "warn", "ok", "warn", "ok"]),
      fields: {
        "Вид имущества": "Крупный рогатый скот",
        "Поголовье": "340 голов",
        "Метод идентификации": "Бирки и ветеринарный журнал",
        "Место содержания": "Ферма Каракуль",
        "Последняя сверка": "2026-06-08"
      },
      monitoring: {
        lastInspection: "2026-06-08",
        inspector: "Шахноза Турсунова",
        condition: "Поголовье подтверждено частично",
        nextInspection: "2026-07-08",
        periodicity: "Ежемесячно",
        completed: true,
        schedule: [
          { date: "2026-06-08", type: "Плановый", result: "328 голов подтверждено", inspector: "Шахноза Турсунова", status: "Завершен" }
        ]
      },
      evaluations: [
        { date: "2026-02-10", appraiser: "Внутренняя оценка", market: 1200000000, pledge: 680000000, method: "Справочник цен", status: "Действует" }
      ],
      insurance: {
        company: "Agro Insurance",
        policy: "AGR-26-330",
        from: "2025-12-20",
        to: "2026-12-20",
        amount: 680000000,
        premiumStatus: "Оплачена",
        source: "Конвейер"
      },
      encumbrances: [
        { number: "ZL-26/228-2", date: "2026-02-06", type: "Залог скота", amount: 520000000, contract: "BG-26/228", allocated: 520000000, ltv: 69, status: "Зарегистрировано" },
        { number: "ZL-26/316-2", date: "2026-03-18", type: "Кросс-обременение скота", amount: 160000000, contract: "LC-26/316", allocated: 160000000, ltv: 85, status: "Зарегистрировано" }
      ],
      pledgors: [
        { share: "100%", name: "AO Bukhara Agro Export", idn: "300 118 454", role: "Залогодатель", check: "Проверен" }
      ],
      externalData: {
        "Источник": "Monitoring/Collection",
        "Дата проверки": "2026-06-08 08:52",
        "Сигнал мониторинга": "Расхождение по 12 головам",
        "Статус взыскания": "Нет",
        "Требование": "Повторный осмотр"
      },
      documents: [
        { name: "Ветеринарный журнал 06-2026.pdf", type: "Мониторинг", required: true, status: "Загружен", date: "2026-06-08" }
      ],
      history: [
        { date: "2026-06-08 08:52", user: "Система", field: "Поголовье", oldValue: "340", newValue: "328 подтверждено", reason: "Мобильный осмотр", source: "Monitoring" }
      ]
    }
  ],
  tasks: [
    // Generated extended demo task queue.
    {
        "id": "TSK-2026-1132",
        "type": "Единичная переоценка",
        "title": "Переоценить складской комплекс после обновления кадастра",
        "collateralId": "COL-001",
        "contractId": "CTR-2026-0148",
        "client": "OOO Orient Warehouse",
        "assignee": "Нодира Каримова",
        "status": "Назначена",
        "dueDate": "2026-06-17",
        "createdAt": "2026-06-16",
        "sla": "Сегодня",
        "priority": "Высокий",
        "source": "Триггер",
        "route": [
            "Регламент",
            "Специалист",
            "Руководитель"
        ],
        "result": "Ожидается подбор аналогов недвижимости",
        "history": [
            {
                "date": "2026-06-16 17:42",
                "user": "Система",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Обновлена кадастровая выписка по объекту"
            }
        ]
    },
    {
        "id": "TSK-2026-1131",
        "type": "Первичный осмотр",
        "title": "Подтвердить новый автотранспорт из таблицы клиента",
        "collateralId": "COL-002",
        "contractId": "CTR-2026-0192",
        "client": "OOO Samarkand Logistic",
        "assignee": "Бахтиер Салиев",
        "status": "В работе",
        "dueDate": "2026-06-17",
        "createdAt": "2026-06-16",
        "sla": "Сегодня",
        "priority": "Критический",
        "source": "Конвейер",
        "route": [
            "Конвейер",
            "Выездной сотрудник",
            "Специалист"
        ],
        "result": "Фото VIN и шин ожидаются из мобильного АРМ",
        "history": [
            {
                "date": "2026-06-16 16:10",
                "user": "Конвейер",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Объект транспорта требует первичного подтверждения"
            }
        ]
    },
    {
        "id": "TSK-2026-1130",
        "type": "Плановый мониторинг",
        "title": "Контроль складских остатков Orient Textile за июнь",
        "collateralId": "COL-004",
        "contractId": "CTR-2026-0148",
        "client": "OOO Orient Textile Group",
        "assignee": "Дилшод Мирзаев",
        "status": "Назначена",
        "dueDate": "2026-06-25",
        "createdAt": "2026-06-16",
        "sla": "Неделя",
        "priority": "Средний",
        "source": "Расписание",
        "route": [
            "Планировщик",
            "Специалист",
            "Архив документов"
        ],
        "result": "Ожидается складской акт и фото партии",
        "history": [
            {
                "date": "2026-06-16 08:00",
                "user": "Планировщик",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Ежемесячный мониторинг товаров в обороте"
            }
        ]
    },
    {
        "id": "TSK-2026-1129",
        "type": "Снятие обременения",
        "title": "Проверить основание частичного снятия по Actros",
        "collateralId": "COL-002",
        "contractId": "CTR-2026-0192",
        "client": "OOO Samarkand Logistic",
        "assignee": "Мадина Юсупова",
        "status": "На доработке",
        "dueDate": "2026-06-18",
        "createdAt": "2026-06-15",
        "sla": "Неделя",
        "priority": "Высокий",
        "source": "Вручную",
        "route": [
            "Специалист",
            "Руководитель",
            "АБС"
        ],
        "result": "Требуется платежное поручение по досрочному погашению",
        "history": [
            {
                "date": "2026-06-15 14:22",
                "user": "Мадина Юсупова",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Запрос клиента на частичное снятие"
            }
        ]
    },
    {
        "id": "TSK-2026-1128",
        "type": "Внеплановый мониторинг",
        "title": "Проверить рисковый сигнал по квартире Саидовой",
        "collateralId": "COL-003",
        "contractId": "CTR-2025-0771",
        "client": "Саидова Дилором Хамидовна",
        "assignee": "Нодира Каримова",
        "status": "В работе",
        "dueDate": "2026-06-18",
        "createdAt": "2026-06-15",
        "sla": "Неделя",
        "priority": "Высокий",
        "source": "OLX.uz",
        "route": [
            "Внешний источник",
            "Специалист",
            "Руководитель"
        ],
        "result": "Проверяется расхождение рыночной цены и залоговой стоимости",
        "history": [
            {
                "date": "2026-06-15 11:18",
                "user": "Система",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Рыночный сигнал по району объекта"
            }
        ]
    },
    {
        "id": "TSK-2026-1127",
        "type": "Замена залога",
        "title": "Оценить замену печатной линии на новое оборудование",
        "collateralId": "COL-007",
        "contractId": "CTR-2024-0644",
        "client": "OOO Tashkent Print Pack",
        "assignee": "Фарход Усманов",
        "status": "Назначена",
        "dueDate": "2026-06-26",
        "createdAt": "2026-06-16",
        "sla": "Норма",
        "priority": "Средний",
        "source": "Вручную",
        "route": [
            "Специалист",
            "Оценка",
            "Руководитель",
            "АБС"
        ],
        "result": "Ожидается карточка нового оборудования",
        "history": [
            {
                "date": "2026-06-16 13:05",
                "user": "Фарход Усманов",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Клиент запросил замену предмета залога"
            }
        ]
    },
    {
        "id": "TSK-2026-1126",
        "type": "Повторный осмотр",
        "title": "Повторно осмотреть поголовье КРС после расхождения",
        "collateralId": "COL-008",
        "contractId": "CTR-2026-0228",
        "client": "AO Bukhara Agro Export",
        "assignee": "Шахноза Турсунова",
        "status": "В работе",
        "dueDate": "2026-06-18",
        "createdAt": "2026-06-16",
        "sla": "Неделя",
        "priority": "Высокий",
        "source": "Monitoring/Collection",
        "route": [
            "Monitoring",
            "Выездной сотрудник",
            "Специалист"
        ],
        "result": "Назначен повторный выезд на ферму Каракуль",
        "history": [
            {
                "date": "2026-06-16 09:14",
                "user": "Система",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Не подтверждены 12 голов по журналу"
            }
        ]
    },
    {
        "id": "TSK-2026-1125",
        "type": "Постановка в залог",
        "title": "Зарегистрировать обременение по складскому комплексу",
        "collateralId": "COL-001",
        "contractId": "CTR-2026-0148",
        "client": "OOO Orient Textile Group",
        "assignee": "Нодира Каримова",
        "status": "В работе",
        "dueDate": "2026-06-19",
        "createdAt": "2026-06-14",
        "sla": "Неделя",
        "priority": "Высокий",
        "source": "АБС",
        "route": [
            "АБС",
            "Специалист",
            "Госреестр",
            "Контроль"
        ],
        "result": "Пакет документов подготовлен к отправке",
        "history": [
            {
                "date": "2026-06-14 10:35",
                "user": "АБС",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Новая выдача требует регистрации залога"
            }
        ]
    },
    {
        "id": "TSK-2026-1124",
        "type": "Единичная переоценка",
        "title": "Переоценить тягач Actros по новым рыночным аналогам",
        "collateralId": "COL-002",
        "contractId": "CTR-2026-0192",
        "client": "OOO Samarkand Logistic",
        "assignee": "Мадина Юсупова",
        "status": "Назначена",
        "dueDate": "2026-06-21",
        "createdAt": "2026-06-16",
        "sla": "Неделя",
        "priority": "Средний",
        "source": "Avtoelon.uz",
        "route": [
            "Маркетплейс",
            "Специалист",
            "Руководитель"
        ],
        "result": "Найдены 3 аналога, ожидаются корректировки эксперта",
        "history": [
            {
                "date": "2026-06-16 12:02",
                "user": "Система",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Автоподбор аналогов по Mercedes-Benz Actros"
            }
        ]
    },
    {
        "id": "TSK-2026-1123",
        "type": "Плановый мониторинг",
        "title": "Проверить страхование и местонахождение Hyundai HD78",
        "collateralId": "COL-006",
        "contractId": "CTR-2026-0192",
        "client": "OOO Samarkand Logistic",
        "assignee": "Бахтиер Салиев",
        "status": "Назначена",
        "dueDate": "2026-06-24",
        "createdAt": "2026-06-16",
        "sla": "Норма",
        "priority": "Средний",
        "source": "Расписание",
        "route": [
            "Планировщик",
            "Выездной сотрудник",
            "Специалист"
        ],
        "result": "Ожидается плановый выезд",
        "history": [
            {
                "date": "2026-06-16 08:15",
                "user": "Планировщик",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Плановая проверка транспорта"
            }
        ]
    },
    {
        "id": "TSK-2026-1122",
        "type": "Первичный осмотр",
        "title": "Подтвердить печатную линию после ремонта",
        "collateralId": "COL-007",
        "contractId": "CTR-2024-0644",
        "client": "OOO Tashkent Print Pack",
        "assignee": "Фарход Усманов",
        "status": "Отложена",
        "dueDate": "2026-06-16",
        "createdAt": "2026-06-12",
        "sla": "Просрочена",
        "priority": "Высокий",
        "source": "Триггер",
        "route": [
            "Риск",
            "Специалист",
            "Мобильный осмотр"
        ],
        "result": "Клиент перенес доступ в цех",
        "history": [
            {
                "date": "2026-06-12 15:11",
                "user": "Система",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Сигнал по неоплаченному страхованию"
            }
        ]
    },
    {
        "id": "TSK-2026-1121",
        "type": "Снятие обременения",
        "title": "Закрыть обременение по части товарных остатков",
        "collateralId": "COL-004",
        "contractId": "CTR-2026-0148",
        "client": "OOO Orient Textile Group",
        "assignee": "Нодира Каримова",
        "status": "Назначена",
        "dueDate": "2026-06-20",
        "createdAt": "2026-06-15",
        "sla": "Неделя",
        "priority": "Средний",
        "source": "Вручную",
        "route": [
            "Специалист",
            "Руководитель",
            "АБС"
        ],
        "result": "Ожидается сверка лимита обременения",
        "history": [
            {
                "date": "2026-06-15 10:04",
                "user": "Нодира Каримова",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Освобождение части партии после погашения"
            }
        ]
    },
    {
        "id": "TSK-2026-1120",
        "type": "Внеплановый мониторинг",
        "title": "Проверить фактическое состояние квартиры",
        "collateralId": "COL-003",
        "contractId": "CTR-2025-0771",
        "client": "Саидова Дилором Хамидовна",
        "assignee": "Фарход Усманов",
        "status": "Назначена",
        "dueDate": "2026-06-19",
        "createdAt": "2026-06-14",
        "sla": "Неделя",
        "priority": "Высокий",
        "source": "Триггер",
        "route": [
            "Риск",
            "Выездной сотрудник",
            "Специалист"
        ],
        "result": "Ожидается фотофиксация объекта",
        "history": [
            {
                "date": "2026-06-14 18:30",
                "user": "Система",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Просроченная оценка и судебный риск"
            }
        ]
    },
    {
        "id": "TSK-2026-1119",
        "type": "Постановка в залог",
        "title": "Проверить пакет документов по оборудованию Unitec",
        "collateralId": "COL-005",
        "contractId": "CTR-2026-0228",
        "client": "AO Bukhara Agro Export",
        "assignee": "Шахноза Турсунова",
        "status": "На доработке",
        "dueDate": "2026-06-18",
        "createdAt": "2026-06-13",
        "sla": "Неделя",
        "priority": "Средний",
        "source": "Конвейер",
        "route": [
            "Конвейер",
            "Специалист",
            "Руководитель"
        ],
        "result": "Не хватает акта ввода второй линии",
        "history": [
            {
                "date": "2026-06-13 09:44",
                "user": "Конвейер",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Пакет документов неполный"
            }
        ]
    },
    {
        "id": "TSK-2026-1118",
        "type": "Единичная переоценка",
        "title": "Обновить стоимость печатной линии Heidelberg",
        "collateralId": "COL-007",
        "contractId": "CTR-2024-0644",
        "client": "OOO Tashkent Print Pack",
        "assignee": "Нодира Каримова",
        "status": "В работе",
        "dueDate": "2026-06-17",
        "createdAt": "2026-06-13",
        "sla": "Сегодня",
        "priority": "Критический",
        "source": "Регламент",
        "route": [
            "Регламент",
            "Специалист",
            "Руководитель"
        ],
        "result": "Оценка готовится с учетом неоплаченной страховки",
        "history": [
            {
                "date": "2026-06-13 08:50",
                "user": "Система",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Истекает срок контроля рыночной стоимости"
            }
        ]
    },
    {
        "id": "TSK-2026-1117",
        "type": "Повторный осмотр",
        "title": "Доснять фасад и идентификаторы складского комплекса",
        "collateralId": "COL-001",
        "contractId": "CTR-2026-0148",
        "client": "OOO Orient Warehouse",
        "assignee": "Бахтиер Салиев",
        "status": "Завершена",
        "dueDate": "2026-06-13",
        "createdAt": "2026-06-11",
        "sla": "Норма",
        "priority": "Средний",
        "source": "Вручную",
        "route": [
            "Специалист",
            "Выездной сотрудник",
            "Архив"
        ],
        "result": "Фото фасада и кадастровой таблички получены",
        "history": [
            {
                "date": "2026-06-13 15:20",
                "user": "Бахтиер Салиев",
                "action": "Завершена",
                "status": "Завершена",
                "comment": "Материалы загружены в досье"
            }
        ]
    },
    {
        "id": "TSK-2026-1116",
        "type": "Плановый мониторинг",
        "title": "Сверить документы страхования по пулу Samarkand Logistic",
        "collateralId": "COL-002",
        "collateralIds": [
            "COL-002",
            "COL-006"
        ],
        "contractId": "CTR-2026-0192",
        "client": "OOO Samarkand Logistic",
        "assignee": "Мадина Юсупова",
        "status": "В работе",
        "dueDate": "2026-06-18",
        "createdAt": "2026-06-12",
        "sla": "Неделя",
        "priority": "Высокий",
        "source": "АБС",
        "route": [
            "АБС",
            "Специалист",
            "Архив документов"
        ],
        "result": "Два объекта в пуле, ожидается новый полис по Actros",
        "documents": [
            {
                "name": "Полис Actros - проект.pdf",
                "target": "COL-002"
            },
            {
                "name": "Полис Hyundai действующий.pdf",
                "target": "COL-006"
            }
        ],
        "history": [
            {
                "date": "2026-06-12 13:46",
                "user": "АБС",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Контроль страхования по пулу транспорта"
            }
        ]
    },
    {
        "id": "TSK-2026-1115",
        "type": "Замена залога",
        "title": "Согласовать замену части товарных остатков на оборудование",
        "collateralId": "COL-004",
        "collateralIds": [
            "COL-004",
            "COL-005"
        ],
        "contractId": "CTR-2026-0148",
        "client": "OOO Orient Textile Group",
        "assignee": "Нодира Каримова",
        "status": "Назначена",
        "dueDate": "2026-06-27",
        "createdAt": "2026-06-16",
        "sla": "Норма",
        "priority": "Средний",
        "source": "Вручную",
        "route": [
            "Специалист",
            "Оценка",
            "Руководитель"
        ],
        "result": "Сформирован пул объектов для сравнения стоимости",
        "documents": [
            {
                "name": "Запрос клиента на замену.pdf",
                "target": "task"
            },
            {
                "name": "Инвентаризационная ведомость.xlsx",
                "target": "COL-004"
            }
        ],
        "history": [
            {
                "date": "2026-06-16 15:03",
                "user": "Нодира Каримова",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Сравнение товарных остатков и оборудования"
            }
        ]
    },
    {
        "id": "TSK-2026-1114",
        "type": "Снятие обременения",
        "title": "Передать в АБС снятие по закрытому лимиту",
        "collateralId": "COL-005",
        "contractId": "CTR-2026-0228",
        "client": "AO Bukhara Agro Export",
        "assignee": "Шахноза Турсунова",
        "status": "Завершена",
        "dueDate": "2026-06-12",
        "createdAt": "2026-06-10",
        "sla": "Норма",
        "priority": "Средний",
        "source": "АБС",
        "route": [
            "Специалист",
            "АБС",
            "Архив"
        ],
        "result": "Снятие передано и подтверждено",
        "history": [
            {
                "date": "2026-06-12 12:10",
                "user": "Шахноза Турсунова",
                "action": "Завершена",
                "status": "Завершена",
                "comment": "АБС приняла изменение обременения"
            }
        ]
    },
    {
        "id": "TSK-2026-1113",
        "type": "Первичный осмотр",
        "title": "Проверить склад хранения товарных остатков",
        "collateralId": "COL-004",
        "contractId": "CTR-2026-0148",
        "client": "OOO Orient Textile Group",
        "assignee": "Дилшод Мирзаев",
        "status": "В работе",
        "dueDate": "2026-06-17",
        "createdAt": "2026-06-14",
        "sla": "Сегодня",
        "priority": "Высокий",
        "source": "Триггер",
        "route": [
            "Риск",
            "Специалист",
            "Фотофиксация"
        ],
        "result": "Проверяется соответствие склада B учетным данным",
        "history": [
            {
                "date": "2026-06-14 09:08",
                "user": "Система",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Сигнал о движении партии без акта"
            }
        ]
    },
    {
        "id": "TSK-2026-1112",
        "type": "Плановый мониторинг",
        "title": "Плановый контроль квартиры Саидовой",
        "collateralId": "COL-003",
        "contractId": "CTR-2025-0771",
        "client": "Саидова Дилором Хамидовна",
        "assignee": "Нодира Каримова",
        "status": "Отложена",
        "dueDate": "2026-06-15",
        "createdAt": "2026-06-08",
        "sla": "Просрочена",
        "priority": "Средний",
        "source": "Расписание",
        "route": [
            "Планировщик",
            "Специалист",
            "Клиент"
        ],
        "result": "Клиент не подтвердил дату доступа",
        "history": [
            {
                "date": "2026-06-15 18:40",
                "user": "Нодира Каримова",
                "action": "Отложена",
                "status": "Отложена",
                "comment": "Ожидается согласование времени осмотра"
            }
        ]
    },
    {
        "id": "TSK-2026-1111",
        "type": "Внеплановый мониторинг",
        "title": "Проверить залоговый реестр по оборудованию Heidelberg",
        "collateralId": "COL-007",
        "contractId": "CTR-2024-0644",
        "client": "OOO Tashkent Print Pack",
        "assignee": "Фарход Усманов",
        "status": "Назначена",
        "dueDate": "2026-06-20",
        "createdAt": "2026-06-16",
        "sla": "Неделя",
        "priority": "Высокий",
        "source": "Госреестр",
        "route": [
            "Госреестр",
            "Специалист",
            "Руководитель"
        ],
        "result": "Ожидается ручная сверка номера обременения",
        "history": [
            {
                "date": "2026-06-16 11:45",
                "user": "Система",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Найдено расхождение статуса регистрации"
            }
        ]
    },
    {
        "id": "TSK-2026-1110",
        "type": "Постановка в залог",
        "title": "Проверить ГСЗ и залогодателей по квартире",
        "collateralId": "COL-003",
        "contractId": "CTR-2025-0771",
        "client": "Саидова Дилором Хамидовна",
        "assignee": "Нодира Каримова",
        "status": "На доработке",
        "dueDate": "2026-06-17",
        "createdAt": "2026-06-11",
        "sla": "Сегодня",
        "priority": "Критический",
        "source": "Вручную",
        "route": [
            "Специалист",
            "Юридическая проверка",
            "Руководитель"
        ],
        "result": "Нужно обновить проверку залогодателя",
        "history": [
            {
                "date": "2026-06-11 12:00",
                "user": "Нодира Каримова",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Дополнительная юридическая проверка"
            }
        ]
    },
    {
        "id": "TSK-2026-1109",
        "type": "Единичная переоценка",
        "title": "Контроль стоимости поголовья КРС",
        "collateralId": "COL-008",
        "contractId": "CTR-2026-0228",
        "client": "AO Bukhara Agro Export",
        "assignee": "Шахноза Турсунова",
        "status": "Назначена",
        "dueDate": "2026-06-23",
        "createdAt": "2026-06-15",
        "sla": "Неделя",
        "priority": "Средний",
        "source": "Регламент",
        "route": [
            "Регламент",
            "Специалист",
            "Руководитель"
        ],
        "result": "Ожидается подтверждение поголовья перед расчетом",
        "history": [
            {
                "date": "2026-06-15 08:30",
                "user": "Система",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Контроль рыночной стоимости биологических активов"
            }
        ]
    },
    {
        "id": "TSK-2026-1108",
        "type": "Повторный осмотр",
        "title": "Повторная проверка линии Unitec после замечаний",
        "collateralId": "COL-005",
        "contractId": "CTR-2026-0228",
        "client": "AO Bukhara Agro Export",
        "assignee": "Бахтиер Салиев",
        "status": "Назначена",
        "dueDate": "2026-06-22",
        "createdAt": "2026-06-16",
        "sla": "Неделя",
        "priority": "Средний",
        "source": "Вручную",
        "route": [
            "Специалист",
            "Выездной сотрудник",
            "Контроль"
        ],
        "result": "Ожидается выезд для проверки маркировки",
        "history": [
            {
                "date": "2026-06-16 10:21",
                "user": "Шахноза Турсунова",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Нужна повторная фотофиксация маркировки"
            }
        ]
    },
    {
        "id": "TSK-2026-1107",
        "type": "Плановый мониторинг",
        "title": "Проверить платеж страховой премии Heidelberg",
        "collateralId": "COL-007",
        "contractId": "CTR-2024-0644",
        "client": "OOO Tashkent Print Pack",
        "assignee": "Нодира Каримова",
        "status": "В работе",
        "dueDate": "2026-06-18",
        "createdAt": "2026-06-15",
        "sla": "Неделя",
        "priority": "Высокий",
        "source": "АБС",
        "route": [
            "АБС",
            "Специалист",
            "Страхование"
        ],
        "result": "Премия не подтверждена, запрошен платежный документ",
        "history": [
            {
                "date": "2026-06-15 09:36",
                "user": "АБС",
                "action": "Создана задача",
                "status": "Назначена",
                "comment": "Неоплаченная страховая премия"
            }
        ]
    },
    {
        "id": "TSK-2026-1106",
        "type": "Замена залога",
        "title": "Предварительно проверить новый складской объект",
        "collateralId": "COL-001",
        "contractId": "CTR-2026-0148",
        "client": "OOO Orient Warehouse",
        "assignee": "Дилшод Мирзаев",
        "status": "Завершена",
        "dueDate": "2026-06-11",
        "createdAt": "2026-06-07",
        "sla": "Норма",
        "priority": "Средний",
        "source": "Вручную",
        "route": [
            "Специалист",
            "Оценка",
            "Архив"
        ],
        "result": "Предварительная проверка завершена, объект пригоден",
        "history": [
            {
                "date": "2026-06-11 17:25",
                "user": "Дилшод Мирзаев",
                "action": "Завершена",
                "status": "Завершена",
                "comment": "Пакет предварительной проверки заполнен"
            }
        ]
    },
    {
        "id": "TSK-2026-1105",
        "type": "Снятие обременения",
        "title": "Архивировать старое обременение по квартире",
        "collateralId": "COL-003",
        "contractId": "CTR-2025-0771",
        "client": "Саидова Дилором Хамидовна",
        "assignee": "Нодира Каримова",
        "status": "Завершена",
        "dueDate": "2026-06-10",
        "createdAt": "2026-06-06",
        "sla": "Норма",
        "priority": "Низкий",
        "source": "АБС",
        "route": [
            "АБС",
            "Специалист",
            "Архив"
        ],
        "result": "Архивная запись закрыта",
        "history": [
            {
                "date": "2026-06-10 12:15",
                "user": "Нодира Каримова",
                "action": "Завершена",
                "status": "Завершена",
                "comment": "Старое обременение перенесено в архив"
            }
        ]
    },
    {
      id: "TSK-2026-1104",
      type: "Повторный осмотр",
      title: "Проверить страхование и фото шин Actros",
      collateralId: "COL-002",
      contractId: "CTR-2026-0192",
      client: "OOO Samarkand Logistic",
      assignee: "Бахтиер Салиев",
      status: "Назначена",
      dueDate: "2026-06-20",
      createdAt: "2026-06-15",
      sla: "Неделя",
      priority: "Высокий",
      source: "Триггер",
      route: ["Автораспределение", "Выездной сотрудник", "Контроль специалиста"],
      result: "Ожидает осмотра",
      history: [
        { date: "2026-06-15 15:49", user: "Система", action: "Создана задача", status: "Назначена", comment: "Сработал риск истечения страховки" }
      ]
    },
    {
      id: "TSK-2026-1098",
      type: "Единичная переоценка",
      title: "Переоценка квартиры по просроченному отчету",
      collateralId: "COL-003",
      contractId: "CTR-2025-0771",
      client: "Саидова Дилором Хамидовна",
      assignee: "Нодира Каримова",
      status: "В работе",
      dueDate: "2026-06-17",
      createdAt: "2026-06-12",
      sla: "Сегодня",
      priority: "Критический",
      source: "Регламент",
      route: ["Специалист", "Руководитель"],
      result: "Аналоги загружены частично",
      history: [
        { date: "2026-06-12 11:07", user: "Система", action: "Создана задача", status: "Назначена", comment: "Окончание срока оценки" },
        { date: "2026-06-13 09:30", user: "Нодира Каримова", action: "Взята в работу", status: "В работе", comment: "Запущен поиск аналогов OLX" }
      ]
    },
    {
      id: "TSK-2026-1081",
      type: "Плановый мониторинг",
      title: "Складская сверка товаров Orient Textile",
      collateralId: "COL-004",
      contractId: "CTR-2026-0148",
      client: "OOO Orient Textile Group",
      assignee: "Дилшод Мирзаев",
      status: "Отложена",
      dueDate: "2026-06-14",
      createdAt: "2026-06-01",
      sla: "Просрочена",
      priority: "Средний",
      source: "Расписание",
      route: ["Специалист", "Архив документов"],
      result: "Ожидается складской акт от клиента",
      history: [
        { date: "2026-06-01 08:00", user: "Система", action: "Создана задача", status: "Назначена", comment: "Ежемесячный мониторинг" },
        { date: "2026-06-13 18:12", user: "Дилшод Мирзаев", action: "Отложена", status: "Отложена", comment: "Нет складского акта" }
      ]
    },
    {
      id: "TSK-2026-1055",
      type: "Постановка в залог",
      title: "Передать складской комплекс в АБС",
      collateralId: "COL-001",
      contractId: "CTR-2026-0148",
      client: "OOO Orient Textile Group",
      assignee: "Нодира Каримова",
      status: "В работе",
      dueDate: "2026-06-18",
      createdAt: "2026-06-10",
      sla: "Неделя",
      priority: "Высокий",
      source: "Конвейер",
      route: ["Конвейер", "Специалист", "АБС"],
      result: "Регистрационные данные проверены",
      history: [
        { date: "2026-06-10 10:00", user: "Конвейер", action: "Создана задача", status: "Назначена", comment: "Новая выдача KM-26/148" }
      ]
    },
    {
      id: "TSK-2026-1022",
      type: "Снятие обременения",
      title: "Снять ограничение по старому договору",
      collateralId: "COL-006",
      contractId: "CTR-2026-0192",
      client: "OOO Samarkand Logistic",
      assignee: "Мадина Юсупова",
      status: "На доработке",
      dueDate: "2026-06-19",
      createdAt: "2026-06-11",
      sla: "Неделя",
      priority: "Средний",
      source: "Вручную",
      route: ["Специалист", "Руководитель", "АБС"],
      result: "Не приложено основание снятия",
      history: [
        { date: "2026-06-11 14:10", user: "Мадина Юсупова", action: "Создана задача", status: "Назначена", comment: "Запрос клиента" },
        { date: "2026-06-12 17:00", user: "Азиз Рахимов", action: "Вернул", status: "На доработке", comment: "Нет основания снятия" }
      ]
    },
    {
      id: "TSK-2026-0999",
      type: "Первичный осмотр",
      title: "Осмотреть линию сортировки Unitec",
      collateralId: "COL-005",
      contractId: "CTR-2026-0228",
      client: "AO Bukhara Agro Export",
      assignee: "Шахноза Турсунова",
      status: "Завершена",
      dueDate: "2026-06-09",
      createdAt: "2026-06-05",
      sla: "Норма",
      priority: "Средний",
      source: "Конвейер",
      route: ["Конвейер", "Выездной сотрудник", "Специалист"],
      result: "Оборудование подтверждено",
      history: [
        { date: "2026-06-05 12:30", user: "Конвейер", action: "Создана задача", status: "Назначена", comment: "Новая гарантия" },
        { date: "2026-06-09 16:20", user: "Шахноза Турсунова", action: "Завершена", status: "Завершена", comment: "Фото и GPS получены" }
      ]
    },
    {
      id: "TSK-2026-0987",
      type: "Внеплановый мониторинг",
      title: "Проверить поголовье КРС после сигнала Monitoring",
      collateralId: "COL-008",
      contractId: "CTR-2026-0228",
      client: "AO Bukhara Agro Export",
      assignee: "Шахноза Турсунова",
      status: "Назначена",
      dueDate: "2026-06-21",
      createdAt: "2026-06-16",
      sla: "Неделя",
      priority: "Высокий",
      source: "Monitoring/Collection",
      route: ["Monitoring", "Выездной сотрудник", "Специалист"],
      result: "Ожидает осмотра",
      history: [
        { date: "2026-06-16 08:52", user: "Система", action: "Создана задача", status: "Назначена", comment: "Расхождение по 12 головам" }
      ]
    },
    {
      id: "TSK-2026-0974",
      type: "Замена залога",
      title: "Сравнить старый и новый объект обеспечения",
      collateralId: "COL-007",
      contractId: "CTR-2024-0644",
      client: "OOO Tashkent Print Pack",
      assignee: "Фарход Усманов",
      status: "В работе",
      dueDate: "2026-06-24",
      createdAt: "2026-06-14",
      sla: "Норма",
      priority: "Средний",
      source: "Вручную",
      route: ["Специалист", "Руководитель", "АБС"],
      result: "Новый объект ожидает внешнюю проверку",
      history: [
        { date: "2026-06-14 09:25", user: "Фарход Усманов", action: "Создана задача", status: "Назначена", comment: "Запрос на замену оборудования" }
      ]
    }
  ],
  integrations: [
    {
      id: "abs",
      name: "АБС Банка",
      group: "Внутренняя",
      status: "Успешно",
      lastSync: "2026-06-16 06:30",
      nextSync: "2026-06-17 06:30",
      method: "Буферные таблицы: сделки и обеспечения",
      fields: 86,
      imported: 42,
      errors: 1,
      logs: [
        { time: "2026-06-16 06:30", result: "Успешно", object: "42 сделки", message: "Импорт завершен, 1 строка с предупреждением" },
        { time: "2026-06-15 06:30", result: "Ошибка", object: "COL-003", message: "Не совпал формат даты оценки, строка пропущена" }
      ]
    },
    {
      id: "conveyor",
      name: "Кредитный конвейер",
      group: "Внутренняя",
      status: "Успешно",
      lastSync: "2026-06-16 10:15",
      nextSync: "По событию",
      method: "REST API: задача, файлы, вердикт",
      fields: 100,
      imported: 7,
      errors: 0,
      logs: [
        { time: "2026-06-16 10:15", result: "Успешно", object: "TSK-2026-1055", message: "Создана задача постановки в залог" }
      ]
    },
    {
      id: "archive",
      name: "Архив кредитной документации",
      group: "Внутренняя",
      status: "Успешно",
      lastSync: "2026-06-16 09:40",
      nextSync: "По запросу",
      method: "Получение документов по залогу",
      fields: 28,
      imported: 16,
      errors: 0,
      logs: [
        { time: "2026-06-16 09:40", result: "Успешно", object: "COL-001", message: "Получены кадастровая выписка и отчет оценки" }
      ]
    },
    {
      id: "monitoring",
      name: "Monitoring/Collection",
      group: "Внутренняя",
      status: "Предупреждение",
      lastSync: "2026-06-16 08:52",
      nextSync: "2026-06-17 08:00",
      method: "Сигналы риска и статусы взыскания",
      fields: 44,
      imported: 3,
      errors: 1,
      logs: [
        { time: "2026-06-16 08:52", result: "Успешно", object: "COL-008", message: "Получен триггер расхождения поголовья" },
        { time: "2026-06-16 08:55", result: "Ошибка", object: "COL-004", message: "Нет складского акта в ответе источника" }
      ]
    },
    {
      id: "garov",
      name: "Государственный залоговый реестр РУз",
      group: "Внешняя",
      status: "Успешно",
      lastSync: "2026-06-16 07:45",
      nextSync: "2026-07-01 07:45",
      method: "Проверка обременений и ограничений",
      fields: 32,
      imported: 8,
      errors: 0,
      logs: [
        { time: "2026-06-16 07:45", result: "Успешно", object: "Портфель", message: "Проверено 8 активных объектов" }
      ]
    },
    {
      id: "cadastre",
      name: "Кадастровое агентство РУз",
      group: "Внешняя",
      status: "Ошибка",
      lastSync: "2026-06-16 07:50",
      nextSync: "Повтор вручную",
      method: "Кадастровые данные и аресты недвижимости",
      fields: 36,
      imported: 2,
      errors: 1,
      logs: [
        { time: "2026-06-16 07:50", result: "Ошибка", object: "COL-003", message: "Источник вернул код 429, требуется повторить" }
      ]
    },
    {
      id: "gai",
      name: "СБДД/ГАИ МВД РУз",
      group: "Внешняя",
      status: "Успешно",
      lastSync: "2026-06-15 14:10",
      nextSync: "2026-07-15 14:10",
      method: "Регистрационные данные и аресты автотранспорта",
      fields: 30,
      imported: 2,
      errors: 0,
      logs: [
        { time: "2026-06-15 14:10", result: "Успешно", object: "COL-002", message: "Аресты и запреты не выявлены" }
      ]
    },
    {
      id: "avtoelon",
      name: "Avtoelon.uz",
      group: "Внешняя",
      status: "Успешно",
      lastSync: "2026-06-13 09:35",
      nextSync: "По задаче переоценки",
      method: "Поиск аналогов автотранспорта",
      fields: 18,
      imported: 3,
      errors: 0,
      logs: [
        { time: "2026-06-13 09:35", result: "Успешно", object: "COL-002", message: "Найдены 3 аналога Mercedes-Benz Actros" }
      ]
    },
    {
      id: "olx",
      name: "OLX.uz",
      group: "Внешняя",
      status: "Предупреждение",
      lastSync: "2026-06-13 09:36",
      nextSync: "По задаче переоценки",
      method: "Поиск аналогов недвижимости",
      fields: 18,
      imported: 2,
      errors: 1,
      logs: [
        { time: "2026-06-13 09:36", result: "Предупреждение", object: "COL-003", message: "Получено 2 аналога из 3, один дубль исключен" }
      ]
    }
  ],
  importRows: [
    { row: 2, collateralId: "COL-009", type: "Автотранспорт", owner: "OOO Fergana Delivery", contract: "AV-26/240", status: "Создать", message: "Новый VIN, проверка СБДД доступна" },
    { row: 3, collateralId: "COL-003", type: "Недвижимость", owner: "Саидова Д.Х.", contract: "IP-25/771", status: "Обновить", message: "Обновить дату оценки и рыночную стоимость" },
    { row: 4, collateralId: "", type: "Оборудование", owner: "OOO New Plast", contract: "KL-26/331", status: "Ошибка", message: "Не заполнен ID залога" },
    { row: 5, collateralId: "COL-010", type: "Ценные бумаги", owner: "AO Capital Invest", contract: "BG-26/260", status: "Ошибка", message: "Тип залога не входит в согласованный шаблон" },
    { row: 6, collateralId: "COL-007", type: "Оборудование", owner: "OOO Tashkent Print Pack", contract: "KL-24/644", status: "Обновить", message: "Обновить статус страхования" }
  ],
  audit: [
    { date: "2026-06-16 10:15", user: "Конвейер", object: "TSK-2026-1055", action: "Создание задачи", oldValue: "-", newValue: "Назначена", source: "API конвейера" },
    { date: "2026-06-16 08:52", user: "Система", object: "COL-008", action: "Сигнал риска", oldValue: "Нет", newValue: "Расхождение поголовья", source: "Monitoring/Collection" },
    { date: "2026-06-15 15:45", user: "Система", object: "COL-002", action: "Сигнал риска", oldValue: "Нет", newValue: "Истечение страховки", source: "АБС" },
    { date: "2026-06-13 18:12", user: "Дилшод Мирзаев", object: "TSK-2026-1081", action: "Отложение задачи", oldValue: "В работе", newValue: "Отложена", source: "АРМ" },
    { date: "2026-06-12 17:00", user: "Азиз Рахимов", object: "TSK-2026-1022", action: "Возврат задачи", oldValue: "В работе", newValue: "На доработке", source: "АРМ руководителя" }
  ],
  comments: [
    { object: "COL-003", date: "2026-06-13 09:40", user: "Нодира Каримова", text: "Нужно запросить свежую кадастровую выписку перед завершением переоценки." },
    { object: "TSK-2026-1104", date: "2026-06-15 16:05", user: "Мадина Юсупова", text: "Попросила клиента подготовить обновленный страховой полис." }
  ]
};

export const reportCatalog = [
  {
    id: "tasks",
    name: "Отчет руководителя по задачам подразделения",
    parameters: ["Период", "Подразделение", "Статус", "Тип задачи"],
    rows: [
      ["Нодира Каримова", "4", "1", "2", "94%"],
      ["Дилшод Мирзаев", "3", "1", "1", "88%"],
      ["Мадина Юсупова", "2", "0", "1", "91%"],
      ["Шахноза Турсунова", "3", "0", "2", "97%"]
    ],
    headers: ["Сотрудник", "Всего задач", "Просрочено", "Завершено", "SLA"]
  },
  {
    id: "employees",
    name: "Отчет по сотрудникам",
    parameters: ["Период", "Регион", "Роль"],
    rows: [
      ["Бахтиер Салиев", "Выездные осмотры", "6", "5", "1"],
      ["Фарход Усманов", "Специалисты", "5", "4", "0"],
      ["Нодира Каримова", "Специалисты", "7", "5", "1"]
    ],
    headers: ["Сотрудник", "Роль", "Назначено", "Закрыто", "Возвраты"]
  },
  {
    id: "collaterals",
    name: "Отчет по видам залогов",
    parameters: ["Период", "Тип залога", "ГСЗ"],
    rows: [
      ["Недвижимость", "2", "5 240 000 000", "1", "94%"],
      ["Автотранспорт", "2", "1 760 000 000", "1", "89%"],
      ["Оборудование", "2", "7 350 000 000", "1", "74%"],
      ["Товары в обороте", "1", "1 000 000 000", "0", "70%"],
      ["Скот", "1", "1 200 000 000", "0", "56%"]
    ],
    headers: ["Тип залога", "Кол-во", "Рыночная стоимость", "Критические", "Средний LTV"]
  }
];

export const marketAnalogs = [
  { type: "Автотранспорт", source: "Avtoelon.uz", object: "Mercedes-Benz Actros 1845 2021", price: 955000000, correction: "+2.5%", result: 979000000 },
  { type: "Автотранспорт", source: "Avtoelon.uz", object: "Mercedes-Benz Actros 1845 2022", price: 990000000, correction: "-1.0%", result: 980100000 },
  { type: "Автотранспорт", source: "Avtoelon.uz", object: "Mercedes-Benz Actros 1845 2020", price: 910000000, correction: "+1.0%", result: 919100000 },
  { type: "Недвижимость", subtype: "Квартира", source: "OLX.uz", object: "Квартира 3 комн., Мирзо-Улугбек", price: 1080000000, correction: "-3.0%", result: 1047600000 },
  { type: "Недвижимость", subtype: "Квартира", source: "OLX.uz", object: "Квартира 82 кв.м, Буюк Ипак Йули", price: 1035000000, correction: "+1.5%", result: 1050525000 },
  { type: "Недвижимость", subtype: "Квартира", source: "OLX.uz", object: "Квартира 80 кв.м, Мирзо-Улугбек", price: 1018000000, correction: "+0.5%", result: 1023090000 },
  { type: "Недвижимость", subtype: "Склад", source: "OLX.uz", object: "Складской комплекс 4 000 кв.м, Ангрен", price: 4280000000, correction: "-2.0%", result: 4194400000 },
  { type: "Недвижимость", subtype: "Склад", source: "Коммерческая недвижимость", object: "Склад и офис 4 350 кв.м, Ташкентская область", price: 4410000000, correction: "-1.0%", result: 4365900000 },
  { type: "Недвижимость", subtype: "Склад", source: "Отчет оценщика", object: "Логистический склад 4 100 кв.м, Чирчик", price: 4160000000, correction: "+1.0%", result: 4201600000 },
  { type: "Оборудование", source: "Dealer equipment offers", object: "Линия сортировки Unitec, 2021", price: 1690000000, correction: "+1.5%", result: 1715350000 },
  { type: "Оборудование", source: "EquipmentTrade.uz", object: "Линия упаковки сухофруктов, 2022", price: 1580000000, correction: "-1.0%", result: 1564200000 },
  { type: "Оборудование", source: "Акт независимой оценки", object: "Печатная линия Heidelberg XL 106, 2020", price: 4020000000, correction: "-2.5%", result: 3919500000 },
  { type: "Товары в обороте", source: "Биржевые котировки", object: "Хлопковая пряжа 1 сорт, партия 580 тонн", price: 690000000, correction: "+0.5%", result: 693450000 },
  { type: "Товары в обороте", source: "Складские предложения", object: "Готовая ткань суровая, партия 610 тонн", price: 725000000, correction: "-1.0%", result: 717750000 },
  { type: "Товары в обороте", source: "Контракты поставщиков", object: "Хлопковая пряжа и ткань, складская партия", price: 705000000, correction: "+1.0%", result: 712050000 },
  { type: "Скот", source: "Агро-маркет", object: "КРС мясного направления, 320 голов", price: 505000000, correction: "+1.5%", result: 512575000 },
  { type: "Скот", source: "Ветеринарный реестр", object: "КРС мясного направления, 350 голов", price: 548000000, correction: "-2.0%", result: 537040000 },
  { type: "Скот", source: "Отчет агрооценщика", object: "Поголовье КРС, 330 голов", price: 522000000, correction: "+0.5%", result: 524610000 }
];
