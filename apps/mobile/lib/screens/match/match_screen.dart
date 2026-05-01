import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../utils/app_theme.dart';

class MatchScreen extends ConsumerStatefulWidget {
  const MatchScreen({super.key});
  @override
  ConsumerState<MatchScreen> createState() => _MatchScreenState();
}

class _MatchScreenState extends ConsumerState<MatchScreen> with SingleTickerProviderStateMixin {
  late TabController _tabs;
  Map<String, dynamic> _stats = {};
  bool _statsLoading = true;

  // New match form
  final _opponentCtrl = TextEditingController();
  String _matchType = 'CASUAL';
  bool _creatingMatch = false;
  Map<String, dynamic>? _createdMatch;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    _loadStats();
  }

  @override
  void dispose() {
    _tabs.dispose();
    _opponentCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadStats() async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    setState(() => _statsLoading = true);
    final stats = await ApiService().getPlayerStats(user.id);
    setState(() { _stats = stats; _statsLoading = false; });
  }

  Future<void> _createMatch() async {
    final user = ref.read(currentUserProvider);
    if (user == null || _opponentCtrl.text.trim().isEmpty) return;
    setState(() => _creatingMatch = true);
    try {
      final match = await ApiService().createMatch({
        'player1_id': user.id,
        'player2_opponent_email': _opponentCtrl.text.trim(),
        'match_type': _matchType,
      });
      setState(() => _createdMatch = match);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _creatingMatch = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Trận đấu'),
        bottom: TabBar(
          controller: _tabs,
          tabs: const [Tab(text: 'Tạo trận'), Tab(text: 'Thống kê')],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: [_buildCreateTab(), _buildStatsTab()],
      ),
    );
  }

  Widget _buildCreateTab() {
    if (_createdMatch != null) {
      return _buildMatchCreated();
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Tạo trận mới', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          TextField(
            controller: _opponentCtrl,
            decoration: const InputDecoration(
              labelText: 'Email đối thủ',
              prefixIcon: Icon(Icons.person_search_outlined),
            ),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _matchType,
            decoration: const InputDecoration(labelText: 'Loại trận'),
            items: const [
              DropdownMenuItem(value: 'CASUAL', child: Text('Casual — Chơi cho vui')),
              DropdownMenuItem(value: 'RANKED', child: Text('Ranked — Tính điểm')),
            ],
            onChanged: (v) { if (v != null) setState(() => _matchType = v); },
          ),
          const SizedBox(height: 24),
          _creatingMatch
              ? const Center(child: CircularProgressIndicator())
              : ElevatedButton.icon(
                  icon: const Icon(Icons.sports_tennis),
                  label: const Text('Tạo trận'),
                  onPressed: _createMatch,
                ),
          if (_matchType == 'RANKED') ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.amber),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Trận Ranked cần QR check-in tại sân và xác nhận từ cả hai bên',
                      style: TextStyle(fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMatchCreated() {
    final matchId = _createdMatch!['id'] as String? ?? '';
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const Icon(Icons.check_circle, color: Colors.green, size: 64),
          const SizedBox(height: 16),
          const Text('Trận đã tạo!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Chia sẻ QR với đối thủ để check-in', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: QrImageView(
                data: 'toten:match:$matchId',
                version: QrVersions.auto,
                size: 200,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text('Match ID: $matchId', style: const TextStyle(fontFamily: 'monospace', fontSize: 12, color: Colors.grey)),
          const SizedBox(height: 24),
          OutlinedButton(
            onPressed: () => setState(() => _createdMatch = null),
            child: const Text('Tạo trận mới'),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsTab() {
    if (_statsLoading) return const Center(child: CircularProgressIndicator());

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              _StatCard('Tổng trận', '${_stats['total_matches'] ?? 0}', Icons.sports_tennis, AppTheme.primary),
              const SizedBox(width: 12),
              _StatCard('Thắng', '${_stats['wins'] ?? 0}', Icons.emoji_events, Colors.green),
              const SizedBox(width: 12),
              _StatCard('Thua', '${_stats['losses'] ?? 0}', Icons.trending_down, Colors.red),
            ],
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Tỉ lệ thắng', style: TextStyle(fontWeight: FontWeight.bold)),
                  Text(
                    '${((_stats['win_rate'] as num?)?.toDouble() ?? 0).toStringAsFixed(1)}%',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primary),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Trận Ranked', style: TextStyle(fontWeight: FontWeight.bold)),
                  Text('${_stats['ranked_matches'] ?? 0}', style: const TextStyle(fontSize: 20)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label, value;
  final IconData icon;
  final Color color;
  const _StatCard(this.label, this.value, this.icon, this.color);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              Icon(icon, color: color),
              const SizedBox(height: 4),
              Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color)),
              Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
            ],
          ),
        ),
      ),
    );
  }
}
