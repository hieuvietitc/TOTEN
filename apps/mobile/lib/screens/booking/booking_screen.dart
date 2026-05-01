import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../models/user.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../utils/app_theme.dart';
import '../../utils/constants.dart';

class BookingScreen extends ConsumerStatefulWidget {
  const BookingScreen({super.key});
  @override
  ConsumerState<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends ConsumerState<BookingScreen> {
  List<Court> _courts = [];
  bool _loading = true;
  String? _selectedCity;
  Court? _selectedCourt;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  int _startHour = 7;
  int _endHour = 8;
  bool _booking = false;

  @override
  void initState() {
    super.initState();
    _loadCourts();
  }

  Future<void> _loadCourts() async {
    setState(() => _loading = true);
    final courts = await ApiService().getCourts(city: _selectedCity);
    setState(() { _courts = courts; _loading = false; });
  }

  double _calculatePrice(Court court) {
    double price = court.basePrice;
    final isWeekend = _selectedDate.weekday >= 6;
    final isPeak = _startHour >= 18 && _startHour <= 21;
    if (isPeak) price *= 1.3;
    if (isWeekend) price *= 1.2;
    return price * (_endHour - _startHour);
  }

  Future<void> _confirmBooking() async {
    if (_selectedCourt == null) return;
    final user = ref.read(currentUserProvider);
    if (user == null) return;

    setState(() => _booking = true);
    try {
      final startTime = DateTime(_selectedDate.year, _selectedDate.month, _selectedDate.day, _startHour);
      final endTime = DateTime(_selectedDate.year, _selectedDate.month, _selectedDate.day, _endHour);
      await ApiService().createBooking({
        'court_id': _selectedCourt!.id,
        'user_id': user.id,
        'start_time': startTime.toIso8601String(),
        'end_time': endTime.toIso8601String(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đặt sân thành công!'), backgroundColor: Colors.green),
        );
        setState(() => _selectedCourt = null);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _booking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Đặt sân tennis')),
      body: Column(
        children: [
          // Filters
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _selectedCity,
                    decoration: const InputDecoration(labelText: 'Thành phố', isDense: true),
                    items: [null, ...AppConstants.cities]
                        .map((c) => DropdownMenuItem(value: c, child: Text(c ?? 'Tất cả')))
                        .toList(),
                    onChanged: (v) { setState(() => _selectedCity = v); _loadCourts(); },
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton.icon(
                  icon: const Icon(Icons.calendar_today, size: 16),
                  label: Text(DateFormat('dd/MM').format(_selectedDate)),
                  onPressed: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _selectedDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 30)),
                    );
                    if (picked != null) setState(() => _selectedDate = picked);
                  },
                ),
              ],
            ),
          ),

          // Court list
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _courts.length,
                    itemBuilder: (_, i) {
                      final court = _courts[i];
                      final selected = _selectedCourt?.id == court.id;
                      return Card(
                        color: selected ? AppTheme.primary.withOpacity(0.1) : null,
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: court.isAvailable ? AppTheme.accent : Colors.grey,
                            child: Icon(
                              court.isIndoor ? Icons.roofing : Icons.grass,
                              color: Colors.white,
                            ),
                          ),
                          title: Text(court.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('${court.clubName ?? ''} · ${court.surfaceType} · ${court.isIndoor ? 'Trong nhà' : 'Ngoài trời'}'),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '${(court.basePrice / 1000).toStringAsFixed(0)}K/h',
                                style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary),
                              ),
                              if (!court.isAvailable)
                                const Text('Đã đặt', style: TextStyle(color: Colors.red, fontSize: 11)),
                            ],
                          ),
                          onTap: court.isAvailable ? () => setState(() => _selectedCourt = court) : null,
                          selected: selected,
                        ),
                      );
                    },
                  ),
          ),

          // Booking panel
          if (_selectedCourt != null)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8, offset: const Offset(0, -2))],
              ),
              child: Column(
                children: [
                  Text(_selectedCourt!.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<int>(
                          value: _startHour,
                          decoration: const InputDecoration(labelText: 'Giờ bắt đầu', isDense: true),
                          items: List.generate(16, (i) => i + 6)
                              .map((h) => DropdownMenuItem(value: h, child: Text('${h}:00')))
                              .toList(),
                          onChanged: (v) { if (v != null) setState(() { _startHour = v; if (_endHour <= v) _endHour = v + 1; }); },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<int>(
                          value: _endHour,
                          decoration: const InputDecoration(labelText: 'Giờ kết thúc', isDense: true),
                          items: List.generate(16, (i) => i + 7)
                              .where((h) => h > _startHour)
                              .map((h) => DropdownMenuItem(value: h, child: Text('${h}:00')))
                              .toList(),
                          onChanged: (v) { if (v != null) setState(() => _endHour = v); },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Tổng: ${(_calculatePrice(_selectedCourt!) / 1000).toStringAsFixed(0)}K VND',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.primary),
                      ),
                      ElevatedButton(
                        onPressed: _booking ? null : _confirmBooking,
                        style: ElevatedButton.styleFrom(minimumSize: const Size(120, 40)),
                        child: _booking
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Text('Đặt sân'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
