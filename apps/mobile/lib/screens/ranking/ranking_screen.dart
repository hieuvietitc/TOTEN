import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/user.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../utils/app_theme.dart';
import '../../utils/constants.dart';

class RankingScreen extends ConsumerStatefulWidget {
  const RankingScreen({super.key});
  @override
  ConsumerState<RankingScreen> createState() => _RankingScreenState();
}

class _RankingScreenState extends ConsumerState<RankingScreen> {
  List<RankEntry> _entries = [];
  bool _loading = true;
  String? _selectedCity;
  Map<String, dynamic> _myRating = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final user = ref.read(currentUserProvider);
    final futures = [
      ApiService().getLeaderboard(city: _selectedCity),
      if (user != null) ApiService().getPlayerRating(user.id),
    ];
    final results = await Future.wait(futures);
    setState(() {
      _entries = results[0] as List<RankEntry>;
      if (results.length > 1) _myRating = results[1] as Map<String, dynamic>;
      _loading = false;
    });
  }

  Color _tierColor(String tier) {
    return switch (tier) {
      'BEGINNER' => Colors.grey,
      'AMATEUR' => Colors.blue,
      'CLUB_PLAYER' => Colors.cyan,
      'ADVANCED' => Colors.orange,
      'ELITE' => Colors.purple,
      _ => Colors.grey,
    };
  }

  Widget _trophyIcon(int rank) {
    if (rank == 1) return const Text('🥇', style: TextStyle(fontSize: 20));
    if (rank == 2) return const Text('🥈', style: TextStyle(fontSize: 20));
    if (rank == 3) return const Text('🥉', style: TextStyle(fontSize: 20));
    return Text('#$rank', style: const TextStyle(fontWeight: FontWeight.bold));
  }

  @override
  Widget build(BuildContext context) {
    final myId = ref.watch(currentUserProvider)?.id;

    return Scaffold(
      appBar: AppBar(title: const Text('Bảng xếp hạng')),
      body: Column(
        children: [
          // My rating card
          if (_myRating.isNotEmpty)
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppTheme.primary, Color(0xFF2E8B57)]),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Rating của tôi', style: TextStyle(color: Colors.white70)),
                  Text(
                    (_myRating['current_rating'] as num?)?.toStringAsFixed(2) ?? '--',
                    style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _myRating['tier'] as String? ?? '',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),

          // Filter
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: DropdownButtonFormField<String>(
              value: _selectedCity,
              decoration: const InputDecoration(labelText: 'Lọc theo thành phố', isDense: true),
              items: [null, ...AppConstants.cities]
                  .map((c) => DropdownMenuItem(value: c, child: Text(c ?? 'Toàn quốc')))
                  .toList(),
              onChanged: (v) { setState(() => _selectedCity = v); _load(); },
            ),
          ),
          const SizedBox(height: 8),

          // Leaderboard
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _load,
                    child: ListView.builder(
                      itemCount: _entries.length,
                      itemBuilder: (_, i) {
                        final e = _entries[i];
                        final isMe = e.userId == myId;
                        return Container(
                          color: isMe ? AppTheme.primary.withOpacity(0.08) : null,
                          child: ListTile(
                            leading: SizedBox(width: 40, child: Center(child: _trophyIcon(e.rank))),
                            title: Row(
                              children: [
                                Text(e.fullName, style: TextStyle(fontWeight: isMe ? FontWeight.bold : FontWeight.normal)),
                                if (isMe) ...[
                                  const SizedBox(width: 6),
                                  const Text('(Tôi)', style: TextStyle(color: AppTheme.primary, fontSize: 12)),
                                ],
                              ],
                            ),
                            subtitle: Text(e.city ?? ''),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  e.rating.toStringAsFixed(2),
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: _tierColor(e.tier).withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    e.tier,
                                    style: TextStyle(color: _tierColor(e.tier), fontSize: 10),
                                  ),
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
