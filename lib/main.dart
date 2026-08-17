import 'package:flutter/material.dart';
import 'api_service.dart';

// Definition of custom emerald colors supporting the branding theme
class Emerald {
  static const Color primary = Color(0xFF10B981);
  static const Color shade50 = Color(0xFFECFDF5);
  static const Color shade100 = Color(0xFFD1FAE5);
  static const Color shade200 = Color(0xFFA7F3D0);
  static const Color shade300 = Color(0xFF6EE7B7);
  static const Color shade500 = Color(0xFF10B981);
  static const Color shade700 = Color(0xFF047857);
  static const Color shade900 = Color(0xFF064E3B);
  static const Color shade950 = Color(0xFF022C22);
}

void main() {
  runApp(const SiswaGoApp());
}

class SiswaGoApp extends StatelessWidget {
  const SiswaGoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SiswaGo Co-Pilot',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF07090e),
        primaryColor: Emerald.primary,
        fontFamily: 'Inter',
        colorScheme: const ColorScheme.dark(
          primary: Emerald.primary,
          secondary: Emerald.shade300,
          background: Color(0xFF07090e),
          surface: Color(0xFF0D121F),
        ),
      ),
      home: const MainDashboardScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class MainDashboardScreen extends StatefulWidget {
  const MainDashboardScreen({super.key});

  @override
  State<MainDashboardScreen> createState() => _MainDashboardScreenState();
}

class _MainDashboardScreenState extends State<MainDashboardScreen> {
  int _activeTab = 0;

  // Transit Controllers
  final TextEditingController _fromController = TextEditingController(text: "Kajang MRT Station");
  final TextEditingController _toController = TextEditingController(text: "TAR UMT KL Campus");
  bool _isEstimating = false;
  Map<String, dynamic>? _transitResult;
  String? _transitError;

  // Expense/SMS Controllers
  final TextEditingController _smsController = TextEditingController(
    text: "TNG eWallet: RM14.50 paid to Mamak Restoran Sri Petaling on 16/06. Bal: RM42.10.",
  );
  bool _isParsing = false;
  Map<String, dynamic>? _smsResult;
  String? _smsError;

  // Calorie Controllers
  final TextEditingController _mealController = TextEditingController(
    text: "Nasi Lemak dengan Ayam Goreng dan Teh O Ais",
  );
  bool _isAnalyzingMeal = false;
  Map<String, dynamic>? _mealResult;
  String? _mealError;

  @override
  void dispose() {
    _fromController.dispose();
    _toController.dispose();
    _smsController.dispose();
    _mealController.dispose();
    super.dispose();
  }

  // Action methods calling ApiService
  Future<void> _runTransitComparison() async {
    setState(() {
      _isEstimating = true;
      _transitResult = null;
      _transitError = null;
    });

    try {
      final res = await ApiService.compareCommutes(
        _fromController.text.trim(),
        _toController.text.trim(),
      );
      setState(() {
        _transitResult = res;
      });
    } catch (e) {
      setState(() {
        _transitError = e.toString();
      });
    } finally {
      setState(() {
        _isEstimating = false;
      });
    }
  }

  Future<void> _runReceiptSMSParsing() async {
    setState(() {
      _isParsing = true;
      _smsResult = null;
      _smsError = null;
    });

    try {
      final res = await ApiService.parseReceiptOrSMS(_smsController.text.trim());
      setState(() {
        _smsResult = res;
      });
    } catch (e) {
      setState(() {
        _smsError = e.toString();
      });
    } finally {
      setState(() {
        _isParsing = false;
      });
    }
  }

  Future<void> _runMealAnalysis() async {
    setState(() {
      _isAnalyzingMeal = true;
      _mealResult = null;
      _mealError = null;
    });

    try {
      final res = await ApiService.analyzeMeal(_mealController.text.trim());
      setState(() {
        _mealResult = res;
      });
    } catch (e) {
      setState(() {
        _mealError = e.toString();
      });
    } finally {
      setState(() {
        _isAnalyzingMeal = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.flash_on, color: Emerald.primary),
            SizedBox(width: 8),
            Text(
              'SiswaGo Co-Pilot',
              style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF0D121F),
        elevation: 0,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12, top: 12, bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Emerald.shade950,
              border: Border.all(color: Emerald.shade900),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              children: [
                Icon(Icons.wifi, size: 12, color: Emerald.primary),
                SizedBox(width: 4),
                Text(
                  'Connected',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Emerald.primary),
                ),
              ],
            ),
          )
        ],
      ),
      body: Column(
        children: [
          // Navigation Tab Bar
          Container(
            color: const Color(0xFF0D121F),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                _buildTabButton(0, Icons.directions_transit, "Transit"),
                const SizedBox(width: 8),
                _buildTabButton(1, Icons.receipt_long, "Parser"),
                const SizedBox(width: 8),
                _buildTabButton(2, Icons.restaurant, "Calorie"),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: IndexedStack(
                index: _activeTab,
                children: [
                  _buildTransitTab(),
                  _buildParserTab(),
                  _buildCalorieTab(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabButton(int index, IconData icon, String label) {
    final bool isSelected = _activeTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _activeTab = index;
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? Emerald.primary : const Color(0xFF05070c),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? Emerald.primary : Colors.grey.withOpacity(0.1),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: isSelected ? Colors.black : Colors.white70),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.black : Colors.white70,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // TAB 1: TRANSIT ESTIMATOR VIEW
  Widget _buildTransitTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Card(
          color: const Color(0xFF0D121F),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: const BorderSide(color: Color(0xFF1E293B)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  "Commute Cost & Carbon Estimator",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _fromController,
                  decoration: const InputDecoration(
                    labelText: "Origin (e.g. Kajang Station)",
                    prefixIcon: Icon(Icons.my_location, color: Colors.white54, size: 18),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _toController,
                  decoration: const InputDecoration(
                    labelText: "Destination (e.g. TAR UMT KL)",
                    prefixIcon: Icon(Icons.location_on, color: Colors.white54, size: 18),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: _isEstimating ? null : _runTransitComparison,
                  icon: _isEstimating
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                        )
                      : const Icon(Icons.compare_arrows, color: Colors.black),
                  label: Text(
                    _isEstimating ? "Comparing..." : "Compare Commutes",
                    style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Emerald.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        if (_transitError != null) _buildErrorCard(_transitError!),
        if (_transitResult != null) ...[
          Text(
            "Comparison Result: ${_transitResult!['journeyName'] ?? ''}",
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Emerald.primary),
          ),
          const SizedBox(height: 8),
          _buildOptionCard("rapidKL LRT/MRT Concession", _transitResult!['lrtMrtOption'], isConcession: true),
          _buildOptionCard("Grab (Simulated)", _transitResult!['grabOption']),
          _buildOptionCard("Bolt (Simulated)", _transitResult!['boltOption']),
          _buildOptionCard("AirAsia Ride (Simulated)", _transitResult!['airAsiaOption']),
          const SizedBox(height: 12),
          Card(
            color: Emerald.shade950,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: Emerald.shade900),
            ),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  const Icon(Icons.lightbulb_outline, color: Emerald.primary),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _transitResult!['costEfficiencyVerdict'] ?? '',
                      style: const TextStyle(fontSize: 11, color: Colors.white70),
                    ),
                  ),
                ],
              ),
            ),
          )
        ],
      ],
    );
  }

  // TAB 2: SMART EXPENSE & RECEIPT PARSER VIEW
  Widget _buildParserTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Card(
          color: const Color(0xFF0D121F),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: const BorderSide(color: Color(0xFF1E293B)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  "Smart Receipt & Ingestion Co-Pilot",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 8),
                const Text(
                  "Paste your Touch 'n Go SMS notification or raw receipt copy below:",
                  style: TextStyle(fontSize: 11, color: Colors.white54),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _smsController,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: "Enter eWallet receipt or SMS pattern...",
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: _isParsing ? null : _runReceiptSMSParsing,
                  icon: _isParsing
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                        )
                      : const Icon(Icons.auto_awesome, color: Colors.black),
                  label: Text(
                    _isParsing ? "Inhaling SMS..." : "Parse & Log Expense",
                    style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Emerald.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        if (_smsError != null) _buildErrorCard(_smsError!),
        if (_smsResult != null) ...[
          const Text(
            "Structured Expense Breakdown",
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Emerald.primary),
          ),
          const SizedBox(height: 8),
          Card(
            color: const Color(0xFF0D121F),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: const BorderSide(color: Color(0xFF1E293B)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildResultRow("Merchant", _smsResult!['merchantName']),
                  _buildResultRow("Amount", "RM ${(_smsResult!['amountMYR'] ?? 0.0).toStringAsFixed(2)}"),
                  _buildResultRow("Category", _smsResult!['category']),
                  _buildResultRow("Payment Method", _smsResult!['paymentMethod']),
                  _buildResultRow("Confidence", "${((_smsResult!['confidenceScore'] ?? 0.0) * 100).toStringAsFixed(0)}%"),
                  _buildResultRow("Items", (_smsResult!['extractedItems'] as List?)?.join(', ') ?? 'None'),
                  _buildResultRow(
                    "Siswa Concession?",
                    _smsResult!['isSiswaEligibleDiscount'] == true ? "YES (50% Concession)" : "NO",
                    valueColor: _smsResult!['isSiswaEligibleDiscount'] == true ? Emerald.primary : Colors.white70,
                  ),
                ],
              ),
            ),
          ),
        ]
      ],
    );
  }

  // TAB 3: CALORIE TRACKER VIEW
  Widget _buildCalorieTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Card(
          color: const Color(0xFF0D121F),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: const BorderSide(color: Color(0xFF1E293B)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  "Siswa Healthy Meal Calculator",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 8),
                const Text(
                  "Describe your meal to run dietary & budget food health analyzes:",
                  style: TextStyle(fontSize: 11, color: Colors.white54),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _mealController,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: "e.g. Roti Canai 2 pieces with Teh Tarik...",
                    prefixIcon: Icon(Icons.fastfood, color: Colors.white54, size: 18),
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: _isAnalyzingMeal ? null : _runMealAnalysis,
                  icon: _isAnalyzingMeal
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                        )
                      : const Icon(Icons.health_and_safety, color: Colors.black),
                  label: Text(
                    _isAnalyzingMeal ? "Analyzing..." : "Analyze Student Meal",
                    style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Emerald.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        if (_mealError != null) _buildErrorCard(_mealError!),
        if (_mealResult != null) ...[
          const Text(
            "Meal Nutrition & Budget Review",
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Emerald.primary),
          ),
          const SizedBox(height: 8),
          Card(
            color: const Color(0xFF0D121F),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: const BorderSide(color: Color(0xFF1E293B)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildResultRow("Meal dish", _mealResult!['dishName']),
                  _buildResultRow("Estimated energy", "${_mealResult!['estimatedCalories']} kcal"),
                  _buildResultRow("Protein", "${_mealResult!['proteinGrams']}g"),
                  _buildResultRow("Carbohydrates", "${_mealResult!['carbsGrams']}g"),
                  _buildResultRow("Fats", "${_mealResult!['fatGrams']}g"),
                  _buildResultRow("Sodium content", "${_mealResult!['sodiumMg']} mg"),
                  _buildResultRow(
                    "Healthy Index",
                    "${_mealResult!['healthyScale']} / 10",
                    valueColor: (_mealResult!['healthyScale'] ?? 5) >= 6 ? Emerald.primary : Colors.redAccent,
                  ),
                  const Divider(color: Colors.white10, height: 24),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.receipt, color: Emerald.primary, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _mealResult!['compositionBreakdown'] ?? '',
                          style: const TextStyle(fontSize: 11, color: Colors.white70, height: 1.4),
                        ),
                      )
                    ],
                  )
                ],
              ),
            ),
          ),
        ]
      ],
    );
  }

  // UTILITY HELPER WIDGETS
  Widget _buildResultRow(String label, dynamic value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.white54)),
          Text(
            value?.toString() ?? '',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: valueColor ?? Colors.white70,
            ),
          )
        ],
      ),
    );
  }

  Widget _buildOptionCard(String provider, Map<String, dynamic>? data, {bool isConcession = false}) {
    if (data == null) return const SizedBox.shrink();
    final double basePrice = (data['basePriceMYR'] ?? 0.0) as double;
    final double? currentSurge = data['currentSurgePriceMYR'] != null ? (data['currentSurgePriceMYR'] as num).toDouble() : null;

    return Card(
      color: isConcession ? Emerald.shade950.withOpacity(0.3) : const Color(0xFF0F172A),
      margin: const EdgeInsets.symmetric(vertical: 4),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: isConcession ? Emerald.shade900 : const Color(0xFF1E293B)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  provider,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: isConcession ? Emerald.primary : Colors.white,
                  ),
                ),
                Text(
                  "${data['durationMinutes'] ?? '15'} mins duration",
                  style: const TextStyle(fontSize: 11, color: Colors.white54),
                )
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  "RM ${((isConcession ? data['studentPriceMYR'] : currentSurge ?? basePrice) as num).toStringAsFixed(2)}",
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                if (currentSurge != null && currentSurge > basePrice)
                  const Text(
                    "High Surge Applied",
                    style: TextStyle(fontSize: 8, color: Colors.orangeAccent),
                  ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildErrorCard(String errorMsg) {
    return Card(
      color: const Color(0xFF450A0A),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: const BorderSide(color: Color(0xFF7F1D1D)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.redAccent),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                errorMsg,
                style: const TextStyle(fontSize: 11, color: Colors.redAccent),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
