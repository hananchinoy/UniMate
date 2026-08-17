import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Replace this with your running Cloud Run development URL or local IP
  static const String baseUrl = 'https://ais-dev-shvudnpygcl3xcdyrg4wxi-871427076931.asia-east1.run.app';

  /// Compares commutes (LRT/MRT, Grab, Bolt, AirAsia Ride)
  static Future<Map<String, dynamic>> compareCommutes(String from, String to) async {
    final url = Uri.parse('$baseUrl/api/gemini/transit-estimate');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'fromLocation': from,
          'toLocation': to,
          'appName': 'SiswaGo',
        }),
      );

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded['success'] == true) {
          return decoded['result'] ?? {};
        }
        throw Exception(decoded['error'] ?? 'Engine failed to return estimate');
      } else {
        throw Exception('Server returned status: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Exception comparing commutes: $e');
    }
  }

  /// Parses raw receipts or standard SMS notifications for budget ingestion
  static Future<Map<String, dynamic>> parseReceiptOrSMS(String rawText) async {
    final url = Uri.parse('$baseUrl/api/gemini/parse-receipt-sms');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'rawText': rawText,
          'appName': 'SiswaGo',
        }),
      );

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded['success'] == true) {
          return decoded['result'] ?? {};
        }
        throw Exception(decoded['error'] ?? 'Engine failed to parse text');
      } else {
        throw Exception('Server returned status: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Exception parsing text: $e');
    }
  }

  /// Analyzes Mamak/University student meals for calorie calculations
  static Future<Map<String, dynamic>> analyzeMeal(String mealDescription) async {
    final url = Uri.parse('$baseUrl/api/gemini/analyze-meal');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'mealDescription': mealDescription,
          'appName': 'SiswaGo',
        }),
      );

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded['success'] == true) {
          return decoded['result'] ?? {};
        }
        throw Exception(decoded['error'] ?? 'Engine failed to analyze meal');
      } else {
        throw Exception('Server returned status: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Exception analyzing meal: $e');
    }
  }
}
