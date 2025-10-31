
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@nutrion_language';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      
      // Tabs
      pantry: 'Pantry',
      planner: 'Planner',
      shopping: 'Shopping',
      profile: 'Profile',
      
      // Pantry
      pantryTitle: 'My Pantry',
      addItem: 'Add Item',
      scanBarcode: 'Scan Barcode',
      foodSearch: 'Food Search',
      itemName: 'Item Name',
      category: 'Category',
      quantity: 'Quantity',
      unit: 'Unit',
      expirationDate: 'Expiration Date',
      notes: 'Notes',
      addToPantry: 'Add to Pantry',
      itemAdded: 'Item added to pantry!',
      itemDeleted: 'Item deleted',
      deleteConfirm: 'Are you sure you want to delete this item?',
      expiresIn: 'Expires in {{days}} days',
      expired: 'Expired',
      fresh: 'Fresh',
      
      // Food Search
      searchPlaceholder: 'Search for food (e.g., banana, chicken)...',
      noResults: 'No results found',
      tryDifferent: 'Try searching for a different food item',
      searchForFoods: 'Search for Foods',
      searchHint: 'Type at least 2 characters to see smart food suggestions',
      resultsFor: '{{count}} results for "{{query}}"',
      
      // Barcode Scanner
      scanBarcodeTitle: 'Scan Barcode',
      cameraPermission: 'Camera Permission Required',
      cameraPermissionText: 'We need access to your camera to scan barcodes',
      grantPermission: 'Grant Permission',
      positionBarcode: 'Position the barcode within the frame',
      lookingUp: 'Looking up product...',
      scanAgain: 'Tap to Scan Again',
      productFound: 'Product Found!',
      productNotFound: 'Product Not Found',
      productNotFoundText: 'This barcode was not found in the database. Please add the item manually.',
      addManually: 'Add Manually',
      tryAgain: 'Try Again',
      
      // Planner
      plannerTitle: 'Meal Planner',
      myRecipes: 'My Recipes',
      aiSuggestions: 'AI Suggestions',
      getAiSuggestions: 'Get AI Recipe Suggestions',
      basedOnPantry: 'Based on your pantry items',
      noRecipes: 'No recipes yet',
      addRecipeHint: 'Add recipes to start planning meals',
      
      // Shopping
      shoppingTitle: 'Shopping List',
      addNewItem: 'Add New Item',
      itemsCompleted: '{{count}} items completed',
      clearCompleted: 'Clear Completed',
      noShoppingItems: 'Your shopping list is empty',
      addItemsHint: 'Add items you need to buy',
      
      // Profile
      profileTitle: 'Profile',
      statistics: 'Statistics',
      totalItems: 'Total Items',
      expiringItems: 'Expiring Soon',
      settings: 'Settings',
      notifications: 'Notifications',
      language: 'Language',
      about: 'About',
      viewOnboarding: 'View Introduction',
      
      // Categories
      dairy: 'Dairy',
      meat: 'Meat',
      fruits: 'Fruits',
      vegetables: 'Vegetables',
      grains: 'Grains',
      beverages: 'Beverages',
      snacks: 'Snacks',
      condiments: 'Condiments',
      frozen: 'Frozen',
      other: 'Other',
      
      // Units
      pcs: 'pcs',
      kg: 'kg',
      g: 'g',
      lb: 'lb',
      oz: 'oz',
      l: 'L',
      ml: 'mL',
      cup: 'cup',
      tbsp: 'tbsp',
      tsp: 'tsp',
      
      // Onboarding
      skip: 'Skip',
      next: 'Next',
      getStarted: 'Get Started',
      onboarding1Title: 'Smart Pantry Management',
      onboarding1Desc: 'Track your food inventory with ease. Scan barcodes or add items manually to keep your pantry organized.',
      onboarding2Title: 'Never Waste Food Again',
      onboarding2Desc: 'Get timely expiration alerts and smart suggestions to use ingredients before they spoil.',
      onboarding3Title: 'AI-Powered Meal Planning',
      onboarding3Desc: 'Discover delicious recipes based on what you already have. Let AI help you plan balanced meals effortlessly.',
    },
  },
  es: {
    translation: {
      // Common
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Agregar',
      search: 'Buscar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      confirm: 'Confirmar',
      
      // Tabs
      pantry: 'Despensa',
      planner: 'Planificador',
      shopping: 'Compras',
      profile: 'Perfil',
      
      // Pantry
      pantryTitle: 'Mi Despensa',
      addItem: 'Agregar Artículo',
      scanBarcode: 'Escanear Código',
      foodSearch: 'Buscar Alimento',
      itemName: 'Nombre del Artículo',
      category: 'Categoría',
      quantity: 'Cantidad',
      unit: 'Unidad',
      expirationDate: 'Fecha de Vencimiento',
      notes: 'Notas',
      addToPantry: 'Agregar a Despensa',
      itemAdded: '¡Artículo agregado a la despensa!',
      itemDeleted: 'Artículo eliminado',
      deleteConfirm: '¿Estás seguro de que quieres eliminar este artículo?',
      expiresIn: 'Vence en {{days}} días',
      expired: 'Vencido',
      fresh: 'Fresco',
      
      // Food Search
      searchPlaceholder: 'Buscar alimento (ej., plátano, pollo)...',
      noResults: 'No se encontraron resultados',
      tryDifferent: 'Intenta buscar un alimento diferente',
      searchForFoods: 'Buscar Alimentos',
      searchHint: 'Escribe al menos 2 caracteres para ver sugerencias inteligentes',
      resultsFor: '{{count}} resultados para "{{query}}"',
      
      // Barcode Scanner
      scanBarcodeTitle: 'Escanear Código',
      cameraPermission: 'Permiso de Cámara Requerido',
      cameraPermissionText: 'Necesitamos acceso a tu cámara para escanear códigos',
      grantPermission: 'Conceder Permiso',
      positionBarcode: 'Posiciona el código dentro del marco',
      lookingUp: 'Buscando producto...',
      scanAgain: 'Toca para Escanear de Nuevo',
      productFound: '¡Producto Encontrado!',
      productNotFound: 'Producto No Encontrado',
      productNotFoundText: 'Este código no se encontró en la base de datos. Por favor, agrega el artículo manualmente.',
      addManually: 'Agregar Manualmente',
      tryAgain: 'Intentar de Nuevo',
      
      // Planner
      plannerTitle: 'Planificador de Comidas',
      myRecipes: 'Mis Recetas',
      aiSuggestions: 'Sugerencias IA',
      getAiSuggestions: 'Obtener Sugerencias de Recetas IA',
      basedOnPantry: 'Basado en los artículos de tu despensa',
      noRecipes: 'Aún no hay recetas',
      addRecipeHint: 'Agrega recetas para comenzar a planificar comidas',
      
      // Shopping
      shoppingTitle: 'Lista de Compras',
      addNewItem: 'Agregar Nuevo Artículo',
      itemsCompleted: '{{count}} artículos completados',
      clearCompleted: 'Limpiar Completados',
      noShoppingItems: 'Tu lista de compras está vacía',
      addItemsHint: 'Agrega artículos que necesites comprar',
      
      // Profile
      profileTitle: 'Perfil',
      statistics: 'Estadísticas',
      totalItems: 'Artículos Totales',
      expiringItems: 'Por Vencer Pronto',
      settings: 'Configuración',
      notifications: 'Notificaciones',
      language: 'Idioma',
      about: 'Acerca de',
      viewOnboarding: 'Ver Introducción',
      
      // Categories
      dairy: 'Lácteos',
      meat: 'Carne',
      fruits: 'Frutas',
      vegetables: 'Verduras',
      grains: 'Granos',
      beverages: 'Bebidas',
      snacks: 'Bocadillos',
      condiments: 'Condimentos',
      frozen: 'Congelados',
      other: 'Otro',
      
      // Units
      pcs: 'pzs',
      kg: 'kg',
      g: 'g',
      lb: 'lb',
      oz: 'oz',
      l: 'L',
      ml: 'mL',
      cup: 'taza',
      tbsp: 'cda',
      tsp: 'cdta',
      
      // Onboarding
      skip: 'Saltar',
      next: 'Siguiente',
      getStarted: 'Comenzar',
      onboarding1Title: 'Gestión Inteligente de Despensa',
      onboarding1Desc: 'Rastrea tu inventario de alimentos con facilidad. Escanea códigos o agrega artículos manualmente para mantener tu despensa organizada.',
      onboarding2Title: 'Nunca Desperdicies Comida',
      onboarding2Desc: 'Recibe alertas oportunas de vencimiento y sugerencias inteligentes para usar ingredientes antes de que se echen a perder.',
      onboarding3Title: 'Planificación de Comidas con IA',
      onboarding3Desc: 'Descubre recetas deliciosas basadas en lo que ya tienes. Deja que la IA te ayude a planificar comidas balanceadas sin esfuerzo.',
    },
  },
  zh: {
    translation: {
      // Common
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      search: '搜索',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      confirm: '确认',
      
      // Tabs
      pantry: '食品储藏室',
      planner: '计划',
      shopping: '购物',
      profile: '个人资料',
      
      // Pantry
      pantryTitle: '我的储藏室',
      addItem: '添加物品',
      scanBarcode: '扫描条形码',
      foodSearch: '搜索食物',
      itemName: '物品名称',
      category: '类别',
      quantity: '数量',
      unit: '单位',
      expirationDate: '过期日期',
      notes: '备注',
      addToPantry: '添加到储藏室',
      itemAdded: '物品已添加到储藏室！',
      itemDeleted: '物品已删除',
      deleteConfirm: '您确定要删除此物品吗？',
      expiresIn: '{{days}}天后过期',
      expired: '已过期',
      fresh: '新鲜',
      
      // Food Search
      searchPlaceholder: '搜索食物（例如：香蕉、鸡肉）...',
      noResults: '未找到结果',
      tryDifferent: '尝试搜索不同的食物',
      searchForFoods: '搜索食物',
      searchHint: '输入至少2个字符以查看智能食物建议',
      resultsFor: '"{{query}}"的{{count}}个结果',
      
      // Barcode Scanner
      scanBarcodeTitle: '扫描条形码',
      cameraPermission: '需要相机权限',
      cameraPermissionText: '我们需要访问您的相机以扫描条形码',
      grantPermission: '授予权限',
      positionBarcode: '将条形码放在框架内',
      lookingUp: '正在查找产品...',
      scanAgain: '点击再次扫描',
      productFound: '找到产品！',
      productNotFound: '未找到产品',
      productNotFoundText: '数据库中未找到此条形码。请手动添加物品。',
      addManually: '手动添加',
      tryAgain: '重试',
      
      // Planner
      plannerTitle: '膳食计划',
      myRecipes: '我的食谱',
      aiSuggestions: 'AI建议',
      getAiSuggestions: '获取AI食谱建议',
      basedOnPantry: '基于您储藏室中的物品',
      noRecipes: '还没有食谱',
      addRecipeHint: '添加食谱以开始计划膳食',
      
      // Shopping
      shoppingTitle: '购物清单',
      addNewItem: '添加新物品',
      itemsCompleted: '已完成{{count}}项',
      clearCompleted: '清除已完成',
      noShoppingItems: '您的购物清单为空',
      addItemsHint: '添加您需要购买的物品',
      
      // Profile
      profileTitle: '个人资料',
      statistics: '统计',
      totalItems: '总物品数',
      expiringItems: '即将过期',
      settings: '设置',
      notifications: '通知',
      language: '语言',
      about: '关于',
      viewOnboarding: '查看介绍',
      
      // Categories
      dairy: '乳制品',
      meat: '肉类',
      fruits: '水果',
      vegetables: '蔬菜',
      grains: '谷物',
      beverages: '饮料',
      snacks: '零食',
      condiments: '调味品',
      frozen: '冷冻食品',
      other: '其他',
      
      // Units
      pcs: '个',
      kg: '千克',
      g: '克',
      lb: '磅',
      oz: '盎司',
      l: '升',
      ml: '毫升',
      cup: '杯',
      tbsp: '汤匙',
      tsp: '茶匙',
      
      // Onboarding
      skip: '跳过',
      next: '下一步',
      getStarted: '开始使用',
      onboarding1Title: '智能储藏室管理',
      onboarding1Desc: '轻松跟踪您的食品库存。扫描条形码或手动添加物品以保持储藏室井然有序。',
      onboarding2Title: '永不浪费食物',
      onboarding2Desc: '获取及时的过期提醒和智能建议，在食材变质前使用它们。',
      onboarding3Title: 'AI驱动的膳食计划',
      onboarding3Desc: '根据您已有的食材发现美味食谱。让AI帮助您轻松计划均衡膳食。',
    },
  },
  ja: {
    translation: {
      // Common
      cancel: 'キャンセル',
      save: '保存',
      delete: '削除',
      edit: '編集',
      add: '追加',
      search: '検索',
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      confirm: '確認',
      
      // Tabs
      pantry: 'パントリー',
      planner: 'プランナー',
      shopping: '買い物',
      profile: 'プロフィール',
      
      // Pantry
      pantryTitle: 'マイパントリー',
      addItem: 'アイテムを追加',
      scanBarcode: 'バーコードをスキャン',
      foodSearch: '食品を検索',
      itemName: 'アイテム名',
      category: 'カテゴリー',
      quantity: '数量',
      unit: '単位',
      expirationDate: '賞味期限',
      notes: 'メモ',
      addToPantry: 'パントリーに追加',
      itemAdded: 'アイテムがパントリーに追加されました！',
      itemDeleted: 'アイテムが削除されました',
      deleteConfirm: 'このアイテムを削除してもよろしいですか？',
      expiresIn: '{{days}}日後に期限切れ',
      expired: '期限切れ',
      fresh: '新鮮',
      
      // Food Search
      searchPlaceholder: '食品を検索（例：バナナ、鶏肉）...',
      noResults: '結果が見つかりません',
      tryDifferent: '別の食品を検索してみてください',
      searchForFoods: '食品を検索',
      searchHint: '少なくとも2文字入力してスマート食品提案を表示',
      resultsFor: '「{{query}}」の{{count}}件の結果',
      
      // Barcode Scanner
      scanBarcodeTitle: 'バーコードをスキャン',
      cameraPermission: 'カメラの許可が必要です',
      cameraPermissionText: 'バーコードをスキャンするにはカメラへのアクセスが必要です',
      grantPermission: '許可を付与',
      positionBarcode: 'バーコードをフレーム内に配置',
      lookingUp: '製品を検索中...',
      scanAgain: 'タップして再スキャン',
      productFound: '製品が見つかりました！',
      productNotFound: '製品が見つかりません',
      productNotFoundText: 'このバーコードはデータベースに見つかりませんでした。手動でアイテムを追加してください。',
      addManually: '手動で追加',
      tryAgain: '再試行',
      
      // Planner
      plannerTitle: '食事プランナー',
      myRecipes: 'マイレシピ',
      aiSuggestions: 'AI提案',
      getAiSuggestions: 'AIレシピ提案を取得',
      basedOnPantry: 'パントリーのアイテムに基づく',
      noRecipes: 'まだレシピがありません',
      addRecipeHint: 'レシピを追加して食事の計画を始めましょう',
      
      // Shopping
      shoppingTitle: '買い物リスト',
      addNewItem: '新しいアイテムを追加',
      itemsCompleted: '{{count}}アイテム完了',
      clearCompleted: '完了をクリア',
      noShoppingItems: '買い物リストは空です',
      addItemsHint: '購入する必要があるアイテムを追加',
      
      // Profile
      profileTitle: 'プロフィール',
      statistics: '統計',
      totalItems: '総アイテム数',
      expiringItems: 'まもなく期限切れ',
      settings: '設定',
      notifications: '通知',
      language: '言語',
      about: 'について',
      viewOnboarding: 'イントロダクションを表示',
      
      // Categories
      dairy: '乳製品',
      meat: '肉',
      fruits: '果物',
      vegetables: '野菜',
      grains: '穀物',
      beverages: '飲料',
      snacks: 'スナック',
      condiments: '調味料',
      frozen: '冷凍食品',
      other: 'その他',
      
      // Units
      pcs: '個',
      kg: 'kg',
      g: 'g',
      lb: 'lb',
      oz: 'oz',
      l: 'L',
      ml: 'mL',
      cup: 'カップ',
      tbsp: '大さじ',
      tsp: '小さじ',
      
      // Onboarding
      skip: 'スキップ',
      next: '次へ',
      getStarted: '始める',
      onboarding1Title: 'スマートパントリー管理',
      onboarding1Desc: '食品在庫を簡単に追跡。バーコードをスキャンするか、手動でアイテムを追加してパントリーを整理します。',
      onboarding2Title: '食品を無駄にしない',
      onboarding2Desc: 'タイムリーな賞味期限アラートとスマート提案で、食材が腐る前に使用します。',
      onboarding3Title: 'AI搭載の食事計画',
      onboarding3Desc: 'すでに持っているものに基づいておいしいレシピを発見。AIがバランスの取れた食事を簡単に計画するのを手伝います。',
    },
  },
  de: {
    translation: {
      // Common
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      search: 'Suchen',
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolg',
      confirm: 'Bestätigen',
      
      // Tabs
      pantry: 'Vorratskammer',
      planner: 'Planer',
      shopping: 'Einkaufen',
      profile: 'Profil',
      
      // Pantry
      pantryTitle: 'Meine Vorratskammer',
      addItem: 'Artikel hinzufügen',
      scanBarcode: 'Barcode scannen',
      foodSearch: 'Lebensmittel suchen',
      itemName: 'Artikelname',
      category: 'Kategorie',
      quantity: 'Menge',
      unit: 'Einheit',
      expirationDate: 'Ablaufdatum',
      notes: 'Notizen',
      addToPantry: 'Zur Vorratskammer hinzufügen',
      itemAdded: 'Artikel zur Vorratskammer hinzugefügt!',
      itemDeleted: 'Artikel gelöscht',
      deleteConfirm: 'Möchten Sie diesen Artikel wirklich löschen?',
      expiresIn: 'Läuft in {{days}} Tagen ab',
      expired: 'Abgelaufen',
      fresh: 'Frisch',
      
      // Food Search
      searchPlaceholder: 'Lebensmittel suchen (z.B. Banane, Hähnchen)...',
      noResults: 'Keine Ergebnisse gefunden',
      tryDifferent: 'Versuchen Sie, nach einem anderen Lebensmittel zu suchen',
      searchForFoods: 'Lebensmittel suchen',
      searchHint: 'Geben Sie mindestens 2 Zeichen ein, um intelligente Lebensmittelvorschläge zu sehen',
      resultsFor: '{{count}} Ergebnisse für "{{query}}"',
      
      // Barcode Scanner
      scanBarcodeTitle: 'Barcode scannen',
      cameraPermission: 'Kameraberechtigung erforderlich',
      cameraPermissionText: 'Wir benötigen Zugriff auf Ihre Kamera, um Barcodes zu scannen',
      grantPermission: 'Berechtigung erteilen',
      positionBarcode: 'Positionieren Sie den Barcode im Rahmen',
      lookingUp: 'Produkt wird gesucht...',
      scanAgain: 'Tippen Sie, um erneut zu scannen',
      productFound: 'Produkt gefunden!',
      productNotFound: 'Produkt nicht gefunden',
      productNotFoundText: 'Dieser Barcode wurde in der Datenbank nicht gefunden. Bitte fügen Sie den Artikel manuell hinzu.',
      addManually: 'Manuell hinzufügen',
      tryAgain: 'Erneut versuchen',
      
      // Planner
      plannerTitle: 'Essensplaner',
      myRecipes: 'Meine Rezepte',
      aiSuggestions: 'KI-Vorschläge',
      getAiSuggestions: 'KI-Rezeptvorschläge erhalten',
      basedOnPantry: 'Basierend auf Ihren Vorratskammer-Artikeln',
      noRecipes: 'Noch keine Rezepte',
      addRecipeHint: 'Fügen Sie Rezepte hinzu, um mit der Essensplanung zu beginnen',
      
      // Shopping
      shoppingTitle: 'Einkaufsliste',
      addNewItem: 'Neuen Artikel hinzufügen',
      itemsCompleted: '{{count}} Artikel erledigt',
      clearCompleted: 'Erledigte löschen',
      noShoppingItems: 'Ihre Einkaufsliste ist leer',
      addItemsHint: 'Fügen Sie Artikel hinzu, die Sie kaufen müssen',
      
      // Profile
      profileTitle: 'Profil',
      statistics: 'Statistiken',
      totalItems: 'Gesamtartikel',
      expiringItems: 'Läuft bald ab',
      settings: 'Einstellungen',
      notifications: 'Benachrichtigungen',
      language: 'Sprache',
      about: 'Über',
      viewOnboarding: 'Einführung anzeigen',
      
      // Categories
      dairy: 'Milchprodukte',
      meat: 'Fleisch',
      fruits: 'Obst',
      vegetables: 'Gemüse',
      grains: 'Getreide',
      beverages: 'Getränke',
      snacks: 'Snacks',
      condiments: 'Gewürze',
      frozen: 'Tiefkühlkost',
      other: 'Sonstiges',
      
      // Units
      pcs: 'Stk',
      kg: 'kg',
      g: 'g',
      lb: 'lb',
      oz: 'oz',
      l: 'L',
      ml: 'mL',
      cup: 'Tasse',
      tbsp: 'EL',
      tsp: 'TL',
      
      // Onboarding
      skip: 'Überspringen',
      next: 'Weiter',
      getStarted: 'Loslegen',
      onboarding1Title: 'Intelligente Vorratskammer-Verwaltung',
      onboarding1Desc: 'Verfolgen Sie Ihr Lebensmittelinventar mit Leichtigkeit. Scannen Sie Barcodes oder fügen Sie Artikel manuell hinzu, um Ihre Vorratskammer organisiert zu halten.',
      onboarding2Title: 'Verschwenden Sie nie wieder Lebensmittel',
      onboarding2Desc: 'Erhalten Sie rechtzeitige Ablaufwarnungen und intelligente Vorschläge, um Zutaten zu verwenden, bevor sie verderben.',
      onboarding3Title: 'KI-gestützte Essensplanung',
      onboarding3Desc: 'Entdecken Sie köstliche Rezepte basierend auf dem, was Sie bereits haben. Lassen Sie KI Ihnen helfen, mühelos ausgewogene Mahlzeiten zu planen.',
    },
  },
  nl: {
    translation: {
      // Common
      cancel: 'Annuleren',
      save: 'Opslaan',
      delete: 'Verwijderen',
      edit: 'Bewerken',
      add: 'Toevoegen',
      search: 'Zoeken',
      loading: 'Laden...',
      error: 'Fout',
      success: 'Succes',
      confirm: 'Bevestigen',
      
      // Tabs
      pantry: 'Voorraadkast',
      planner: 'Planner',
      shopping: 'Boodschappen',
      profile: 'Profiel',
      
      // Pantry
      pantryTitle: 'Mijn Voorraadkast',
      addItem: 'Item toevoegen',
      scanBarcode: 'Barcode scannen',
      foodSearch: 'Voedsel zoeken',
      itemName: 'Itemnaam',
      category: 'Categorie',
      quantity: 'Hoeveelheid',
      unit: 'Eenheid',
      expirationDate: 'Vervaldatum',
      notes: 'Notities',
      addToPantry: 'Toevoegen aan voorraadkast',
      itemAdded: 'Item toegevoegd aan voorraadkast!',
      itemDeleted: 'Item verwijderd',
      deleteConfirm: 'Weet u zeker dat u dit item wilt verwijderen?',
      expiresIn: 'Verloopt over {{days}} dagen',
      expired: 'Verlopen',
      fresh: 'Vers',
      
      // Food Search
      searchPlaceholder: 'Zoek voedsel (bijv. banaan, kip)...',
      noResults: 'Geen resultaten gevonden',
      tryDifferent: 'Probeer een ander voedingsmiddel te zoeken',
      searchForFoods: 'Voedsel zoeken',
      searchHint: 'Typ minimaal 2 tekens om slimme voedselvoorstellen te zien',
      resultsFor: '{{count}} resultaten voor "{{query}}"',
      
      // Barcode Scanner
      scanBarcodeTitle: 'Barcode scannen',
      cameraPermission: 'Cameramachtiging vereist',
      cameraPermissionText: 'We hebben toegang tot uw camera nodig om barcodes te scannen',
      grantPermission: 'Machtiging verlenen',
      positionBarcode: 'Plaats de barcode binnen het kader',
      lookingUp: 'Product opzoeken...',
      scanAgain: 'Tik om opnieuw te scannen',
      productFound: 'Product gevonden!',
      productNotFound: 'Product niet gevonden',
      productNotFoundText: 'Deze barcode is niet gevonden in de database. Voeg het item handmatig toe.',
      addManually: 'Handmatig toevoegen',
      tryAgain: 'Opnieuw proberen',
      
      // Planner
      plannerTitle: 'Maaltijdplanner',
      myRecipes: 'Mijn recepten',
      aiSuggestions: 'AI-suggesties',
      getAiSuggestions: 'AI-receptsuggesties ophalen',
      basedOnPantry: 'Gebaseerd op uw voorraadkast items',
      noRecipes: 'Nog geen recepten',
      addRecipeHint: 'Voeg recepten toe om te beginnen met het plannen van maaltijden',
      
      // Shopping
      shoppingTitle: 'Boodschappenlijst',
      addNewItem: 'Nieuw item toevoegen',
      itemsCompleted: '{{count}} items voltooid',
      clearCompleted: 'Voltooide wissen',
      noShoppingItems: 'Uw boodschappenlijst is leeg',
      addItemsHint: 'Voeg items toe die u moet kopen',
      
      // Profile
      profileTitle: 'Profiel',
      statistics: 'Statistieken',
      totalItems: 'Totaal items',
      expiringItems: 'Verloopt binnenkort',
      settings: 'Instellingen',
      notifications: 'Meldingen',
      language: 'Taal',
      about: 'Over',
      viewOnboarding: 'Introductie bekijken',
      
      // Categories
      dairy: 'Zuivel',
      meat: 'Vlees',
      fruits: 'Fruit',
      vegetables: 'Groenten',
      grains: 'Granen',
      beverages: 'Dranken',
      snacks: 'Snacks',
      condiments: 'Kruiden',
      frozen: 'Diepvries',
      other: 'Overig',
      
      // Units
      pcs: 'stk',
      kg: 'kg',
      g: 'g',
      lb: 'lb',
      oz: 'oz',
      l: 'L',
      ml: 'mL',
      cup: 'kop',
      tbsp: 'el',
      tsp: 'tl',
      
      // Onboarding
      skip: 'Overslaan',
      next: 'Volgende',
      getStarted: 'Aan de slag',
      onboarding1Title: 'Slimme voorraadkastbeheer',
      onboarding1Desc: 'Volg uw voedselvoorraad met gemak. Scan barcodes of voeg items handmatig toe om uw voorraadkast georganiseerd te houden.',
      onboarding2Title: 'Verspil nooit meer voedsel',
      onboarding2Desc: 'Ontvang tijdige vervalmeldingen en slimme suggesties om ingrediënten te gebruiken voordat ze bederven.',
      onboarding3Title: 'AI-aangedreven maaltijdplanning',
      onboarding3Desc: 'Ontdek heerlijke recepten op basis van wat u al heeft. Laat AI u helpen moeiteloos uitgebalanceerde maaltijden te plannen.',
    },
  },
  fr: {
    translation: {
      // Common
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      search: 'Rechercher',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      confirm: 'Confirmer',
      
      // Tabs
      pantry: 'Garde-manger',
      planner: 'Planificateur',
      shopping: 'Courses',
      profile: 'Profil',
      
      // Pantry
      pantryTitle: 'Mon garde-manger',
      addItem: 'Ajouter un article',
      scanBarcode: 'Scanner le code-barres',
      foodSearch: 'Rechercher des aliments',
      itemName: 'Nom de l\'article',
      category: 'Catégorie',
      quantity: 'Quantité',
      unit: 'Unité',
      expirationDate: 'Date d\'expiration',
      notes: 'Notes',
      addToPantry: 'Ajouter au garde-manger',
      itemAdded: 'Article ajouté au garde-manger !',
      itemDeleted: 'Article supprimé',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cet article ?',
      expiresIn: 'Expire dans {{days}} jours',
      expired: 'Expiré',
      fresh: 'Frais',
      
      // Food Search
      searchPlaceholder: 'Rechercher des aliments (ex : banane, poulet)...',
      noResults: 'Aucun résultat trouvé',
      tryDifferent: 'Essayez de rechercher un autre aliment',
      searchForFoods: 'Rechercher des aliments',
      searchHint: 'Tapez au moins 2 caractères pour voir les suggestions intelligentes',
      resultsFor: '{{count}} résultats pour "{{query}}"',
      
      // Barcode Scanner
      scanBarcodeTitle: 'Scanner le code-barres',
      cameraPermission: 'Autorisation de caméra requise',
      cameraPermissionText: 'Nous avons besoin d\'accéder à votre caméra pour scanner les codes-barres',
      grantPermission: 'Accorder l\'autorisation',
      positionBarcode: 'Positionnez le code-barres dans le cadre',
      lookingUp: 'Recherche du produit...',
      scanAgain: 'Appuyez pour scanner à nouveau',
      productFound: 'Produit trouvé !',
      productNotFound: 'Produit non trouvé',
      productNotFoundText: 'Ce code-barres n\'a pas été trouvé dans la base de données. Veuillez ajouter l\'article manuellement.',
      addManually: 'Ajouter manuellement',
      tryAgain: 'Réessayer',
      
      // Planner
      plannerTitle: 'Planificateur de repas',
      myRecipes: 'Mes recettes',
      aiSuggestions: 'Suggestions IA',
      getAiSuggestions: 'Obtenir des suggestions de recettes IA',
      basedOnPantry: 'Basé sur les articles de votre garde-manger',
      noRecipes: 'Pas encore de recettes',
      addRecipeHint: 'Ajoutez des recettes pour commencer à planifier des repas',
      
      // Shopping
      shoppingTitle: 'Liste de courses',
      addNewItem: 'Ajouter un nouvel article',
      itemsCompleted: '{{count}} articles terminés',
      clearCompleted: 'Effacer les terminés',
      noShoppingItems: 'Votre liste de courses est vide',
      addItemsHint: 'Ajoutez des articles que vous devez acheter',
      
      // Profile
      profileTitle: 'Profil',
      statistics: 'Statistiques',
      totalItems: 'Total des articles',
      expiringItems: 'Expire bientôt',
      settings: 'Paramètres',
      notifications: 'Notifications',
      language: 'Langue',
      about: 'À propos',
      viewOnboarding: 'Voir l\'introduction',
      
      // Categories
      dairy: 'Produits laitiers',
      meat: 'Viande',
      fruits: 'Fruits',
      vegetables: 'Légumes',
      grains: 'Céréales',
      beverages: 'Boissons',
      snacks: 'Collations',
      condiments: 'Condiments',
      frozen: 'Surgelés',
      other: 'Autre',
      
      // Units
      pcs: 'pcs',
      kg: 'kg',
      g: 'g',
      lb: 'lb',
      oz: 'oz',
      l: 'L',
      ml: 'mL',
      cup: 'tasse',
      tbsp: 'c. à s.',
      tsp: 'c. à c.',
      
      // Onboarding
      skip: 'Passer',
      next: 'Suivant',
      getStarted: 'Commencer',
      onboarding1Title: 'Gestion intelligente du garde-manger',
      onboarding1Desc: 'Suivez votre inventaire alimentaire en toute simplicité. Scannez les codes-barres ou ajoutez des articles manuellement pour garder votre garde-manger organisé.',
      onboarding2Title: 'Ne gaspillez plus jamais de nourriture',
      onboarding2Desc: 'Recevez des alertes d\'expiration en temps opportun et des suggestions intelligentes pour utiliser les ingrédients avant qu\'ils ne se gâtent.',
      onboarding3Title: 'Planification de repas alimentée par l\'IA',
      onboarding3Desc: 'Découvrez de délicieuses recettes basées sur ce que vous avez déjà. Laissez l\'IA vous aider à planifier des repas équilibrés sans effort.',
    },
  },
};

// Get saved language or use device locale
const getInitialLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      return savedLanguage;
    }
    
    // Get device locale
    const deviceLocale = Localization.getLocales()[0];
    const languageCode = deviceLocale.languageCode || 'en';
    
    // Map language codes to supported languages
    if (resources[languageCode as keyof typeof resources]) {
      return languageCode;
    }
    
    return 'en';
  } catch (error) {
    console.error('Error getting initial language:', error);
    return 'en';
  }
};

// Initialize i18n
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      compatibilityJSON: 'v3',
    });
};

initI18n();

// Save language preference
export const changeLanguage = async (languageCode: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    await i18n.changeLanguage(languageCode);
    console.log('Language changed to:', languageCode);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Get current language
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

// Get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
  ];
};

export default i18n;
