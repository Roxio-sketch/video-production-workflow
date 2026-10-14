package dev.vfxworkbench.effects.lightning;
import net.minecraft.world.phys.Vec3;
public final class LightningVideoBridge {
 public static void start(Vec3 position){LightningClient.previewAt(position,0);}
 public static void time(double ticks){LightningClient.freezeForProbe(ticks);}
}
