package dev.vfxworkbench.effects.blackhole;
import net.minecraft.world.phys.Vec3;
public final class BlackHoleVideoBridge {
 public static void place(Vec3 position){BlackHoleClient.preview();BlackHoleClient.center=position;}
 public static void time(double seconds){BlackHoleRender.frozenTime=(float)(seconds*20);}
}
