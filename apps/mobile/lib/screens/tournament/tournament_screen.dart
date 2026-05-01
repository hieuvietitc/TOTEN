import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../models/user.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../utils/app_theme.dart';

class TournamentScreen extends ConsumerStatefulWidget {
  const TournamentScreen({super.key});
  @override
  ConsumerState<TournamentScreen> createState() => _TournamentScreenState();
}

class _TournamentScreenState extends ConsumerState<TournamentScreen> {
  List<Tournament> _tournaments = [];
  bool _loading = true;
  String? _filter;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final list = await ApiService().getTournaments(status: _filter);
    setState(() { _tournaments = list; _loading = false; });
  }

  Future<void> _register(Tournament t) async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    try {
      await ApiService().registerTournament(t.id, user.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Đã đăng ký ${t.name}!'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Color _typeColor(String type) => switch (type) {
    'LOCAL' => Colors.grey,
    'CITY' => Colors.blue,
    'PROVINCIAL' => Colors.orange,
    'NATIONAL' => Colors.red,
    _ => Colors.grey,
  };

  Color _statusColor(String status) => switch (status) {
    'UPCOMING' => Colors.blue,
    'ONGOING' => Colors.green,
    'COMPLETED' => Colors.grey,
    'CANCELLED' => Colors.red,
    _ => Colors.grey,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Giải đấu')),
      body: Column(
        children: [
          // Filter chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [null, 'UPCOMING', 'ONGOING', 'COMPLETED'].map((s) {
                final label = switch (s) {
                  null => 'Tất cả',
                  'UPCOMING' => 'Sắp diễn ra',
                  'ONGOING' => 'Đang diễn ra',
                  'COMPLETED' => 'Đã kết thúc',
                  _ => s,
                };
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(label),
                    selected: _filter == s,
                    onSelected: (_) { setState(() => _filter = s); _load(); },
                    selectedColor: AppTheme.primary.withOpacity(0.2),
                  ),
                );
              }).toList(),
            ),
          ),

          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _load,
                    child: _tournaments.isEmpty
                        ? const Center(child: Text('Không có giải đấu nào'))
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _tournaments.length,
                            itemBuilder: (_, i) {
                              final t = _tournaments[i];
                              return Card(
                                margin: const EdgeInsets.only(bottom: 12),
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(t.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: _typeColor(t.type).withOpacity(0.15),
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            child: Text(t.type, style: TextStyle(color: _typeColor(t.type), fontSize: 12)),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                                          const SizedBox(width: 4),
                                          Text(
                                            '${DateFormat('dd/MM/yy').format(DateTime.parse(t.startDate))} - ${DateFormat('dd/MM/yy').format(DateTime.parse(t.endDate))}',
                                            style: const TextStyle(color: Colors.grey, fontSize: 13),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          const Icon(Icons.people_outline, size: 14, color: Colors.grey),
                                          const SizedBox(width: 4),
                                          Text('${t.maxParticipants} người', style: const TextStyle(color: Colors.grey, fontSize: 13)),
                                          const SizedBox(width: 16),
                                          const Icon(Icons.emoji_events_outlined, size: 14, color: Colors.amber),
                                          const SizedBox(width: 4),
                                          Text(
                                            '${(t.prizePool / 1_000_000).toStringAsFixed(0)}M VND',
                                            style: const TextStyle(color: Colors.amber, fontSize: 13, fontWeight: FontWeight.bold),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: _statusColor(t.status).withOpacity(0.15),
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            child: Text(t.status, style: TextStyle(color: _statusColor(t.status), fontSize: 12)),
                                          ),
                                          if (t.status == 'UPCOMING')
                                            ElevatedButton.icon(
                                              icon: const Icon(Icons.how_to_reg, size: 16),
                                              label: const Text('Đăng ký'),
                                              onPressed: () => _register(t),
                                              style: ElevatedButton.styleFrom(
                                                minimumSize: const Size(100, 32),
                                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                              ),
                                            ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }
}
