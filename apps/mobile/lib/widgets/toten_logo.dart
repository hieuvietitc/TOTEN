import 'package:flutter/material.dart';
import '../utils/app_theme.dart';

class TotenLogo extends StatelessWidget {
  final double size;
  const TotenLogo({super.key, this.size = 48});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: AppTheme.primary,
        borderRadius: BorderRadius.circular(size * 0.2),
      ),
      child: Center(
        child: Text(
          '🎾',
          style: TextStyle(fontSize: size * 0.55),
        ),
      ),
    );
  }
}
