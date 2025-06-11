class DeadlockHeroesApp {
    constructor() {
        this.heroes = [];
        this.modal = document.getElementById('hero-modal');
        this.modalBody = document.getElementById('modal-body');
        this.init();
    }

    async init() {
        this.showLoading();
        this.setupModalEvents();
        try {
            await this.loadHeroes();
            this.renderHeroes();
            this.updateStats();
        } catch (error) {
            this.showError();
            console.error('Error initializing app:', error);
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('heroes-container').style.display = 'none';
    }

    // MODIFIED: This function now correctly tries to fetch your JSON file
    async loadHeroes() {
        try {
            // Attempt to fetch the user's local heroes.json file
            const response = await fetch('heroes.json');
            if (!response.ok) {
                // If the file is not found or another error occurs, throw to trigger the catch block
                throw new Error(`Failed to fetch heroes.json: ${response.statusText}`);
            }
            const data = await response.json();
            this.heroes = Array.isArray(data) ? data : [data];
            console.log('Successfully loaded heroes from heroes.json');
        } catch (error) {
            // If fetching fails, fall back to the sample data
            console.warn(`${error.message}. Using sample data for demonstration.`);
            this.heroes = hArr;
        }
    }
    
    getSampleHero(id = 1, name = "Infernus", className = "hero_inferno", image) {
        return { "id": id, "class_name": className, "name": name, "description": { "lore": "A being of pure energy, this hero was once a wild, rebellious, and impetuous entity from another plane. Their youth was filled with chaos, but they now seek to bring balance to the battlefield. They harness raw power to control zones and incinerate foes who challenge their domain.", "role": "Area Denial & Control", "playstyle": "This hero excels at dealing damage over time, controlling the flow of combat by zoning enemies and punishing those who dare to enter their domain. High mobility allows for quick repositioning." }, "recommended_upgrades": ["Rapid Rounds", "Mystic Regeneration", "Clip Size", "Improved Spirit", "Blitz Bullets", "Tech Defense Shredders", "Quick Silver", "Extra Charge"], "recommended_ability_order": ["Zone Control", "Phase Shift", "Energy Pulse", "Overload"], "starting_stats": { "max_health": { "value": id === 3 ? 1200 : 750 }, "max_move_speed": { "value": id === 2 ? 7.5 : 6.8 }, "light_melee_damage": { "value": id === 3 ? 80 : 63 }, "heavy_melee_damage": { "value": id === 3 ? 150 : 116 } }, "images": { "selection_image": image } };
    }

    renderHeroes() {
        const container = document.getElementById('heroes-container');
        const loading = document.getElementById('loading');
        
        loading.style.display = 'none';
        container.style.display = 'grid';

        container.innerHTML = this.heroes.map(hero => this.createHeroCard(hero)).join('');
        
        document.querySelectorAll('.expand-button').forEach(btn => {
            btn.addEventListener('click', this.openModal.bind(this));
        });
    }

    createHeroCard(hero) {
        const imageUrl = hero.images?.selection_image || `https://placehold.co/600x400/1A1A2E/E5E7EB?text=${hero.name?.charAt(0) || 'H'}`;
        
        return `
            <div class="hero-card">
                <div class="hero-card-banner">
                    <img src="${imageUrl}" alt="Image of ${hero.name}" class="hero-banner-image" 
                         onerror="this.onerror=null; this.src='https://placehold.co/600x400/0F0F23/FFFFFF?text=Error';">
                    <div class="banner-overlay"></div>
                    <div class="hero-card-header">
                        <div>
                            <div class="hero-name">${hero.name || 'Unknown Hero'}</div>
                            <div class="hero-class">${this.formatClassName(hero.class_name)}</div>
                        </div>
                        <div class="hero-role">${hero.description?.role || 'Unknown Role'}</div>
                    </div>
                </div>
                
                <div class="hero-content">
                    <div class="hero-description">
                        <p class="lore-text">${this.truncateText(hero.description?.lore || 'No background information available.', 150)}</p>
                        <p class="playstyle-text">${hero.description?.playstyle || 'Playstyle information not available.'}</p>
                    </div>
                    
                    <div class="hero-stats">
                        ${this.renderStatCards(hero.starting_stats)}
                    </div>
                    
                    <button class="expand-button" data-hero-id="${hero.id}">
                        View Detailed Analysis
                    </button>
                </div>
            </div>
        `;
    }
    
    renderStatCards(stats) {
        if (!stats) return '<div class="stat-card"><div class="stat-card-value">--</div><div class="stat-card-label">No Data</div></div>';
        const displayStats = [ { key: 'max_health', label: 'Health' }, { key: 'max_move_speed', label: 'Speed' }, { key: 'light_melee_damage', label: 'Light Attack' }, { key: 'heavy_melee_damage', label: 'Heavy Attack' } ];
        return displayStats.map(stat => {
            const value = stats[stat.key]?.value;
            return `<div class="stat-card"><div class="stat-card-value">${value !== undefined ? value : '--'}</div><div class="stat-card-label">${stat.label}</div></div>`;
        }).join('');
    }
    
    // Utility functions
    formatClassName(name) { return name ? name.replace(/^hero_|_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim() : 'Unknown'; }
    formatAbilityName(name) { return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); }
    formatUpgradeName(name) { return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); }
    truncateText(text, len) { return (!text || text.length <= len) ? text : text.substring(0, len) + '...'; }

    updateStats() {
        document.getElementById('total-heroes').textContent = this.heroes.length;
    }
    
    setupModalEvents() {
        const closeButton = this.modal.querySelector('.modal-close-button');
        closeButton.addEventListener('click', this.closeModal.bind(this));
        
        this.modal.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openModal(event) {
        const heroId = event.currentTarget.getAttribute('data-hero-id');
        const hero = this.heroes.find(h => h.id.toString() === heroId);

        if (!hero) return;

        const modalContentHTML = `
            <div class="hero-card-header">
                 <div>
                    <div class="hero-name">${hero.name || 'Unknown'}</div>
                    <div class="hero-class">${this.formatClassName(hero.class_name)}</div>
                </div>
                <div class="hero-role">${hero.description?.role || 'Unknown'}</div>
            </div>

            <div class="info-section">
                <div class="section-header">Complete Background</div>
                <div class="lore-text">${hero.description?.lore || 'No info.'}</div>
            </div>
            
            <div class="info-section">
                <div class="section-header">Recommended Abilities</div>
                <div class="abilities-grid">
                    ${(hero.recommended_ability_order || []).map(a => `<span class="ability-tag">${this.formatAbilityName(a)}</span>`).join('') || 'None'}
                </div>
            </div>
            
            <div class="info-section">
                <div class="section-header">Recommended Upgrades</div>
                <div class="upgrades-grid">
                    ${(hero.recommended_upgrades || []).map(u => `<span class="upgrade-tag">${this.formatUpgradeName(u)}</span>`).join('') || 'None'}
                </div>
            </div>
        `;

        this.modalBody.innerHTML = modalContentHTML;
        document.body.style.overflow = 'hidden';
        this.modal.style.display = 'flex';
        setTimeout(() => this.modal.classList.add('show'), 10);
    }

    closeModal() {
        document.body.style.overflow = '';
        this.modal.classList.remove('show');
        
        const onTransitionEnd = () => {
            this.modal.style.display = 'none';
            this.modal.removeEventListener('transitionend', onTransitionEnd);
        }
        this.modal.addEventListener('transitionend', onTransitionEnd);
    }

    showError() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error-message').style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => new DeadlockHeroesApp());

var hArr = [
    {
        "id": 1,
        "class_name": "hero_inferno",
        "name": "Infernus",
        "description": {
          "lore": "Like most teenagers; Infernus was wild, rebellious, and impetuous.  Unlike most teenagers, Infernus was a creature from another plane and had a supernatural mastery over fire.  Needless to say:  his youth was filled with no small amount of arson, murder, and evidence disposal.  But that was then.  Now an adult, Infernus has mellowed out considerably.  He\u2019s happy working at a bar with good live music, and talking to interesting people.  That being said when someone at the bar gets belligerent or violent, he\u2019s not afraid to dust off the skills he once honed.",
          "role": "Lights up enemies and watches them burn",
          "playstyle": "Infernus has many ways to deal damage over time, burning foes before swooping in for the kill. Due to Infernus' blazing speed, his enemies won't be able to escape the flames."
        },
        "recommended_upgrades": [
          "upgrade_rapid_rounds",
          "upgrade_mystic_regeneration",
          "upgrade_clip_size",
          "upgrade_improved_spirit",
          "upgrade_blitz_bullets",
          "upgrade_tech_defense_shredders",
          "upgrade_quick_silver",
          "upgrade_extra_charge",
          "upgrade_magic_shield",
          "upgrade_regenerating_bullet_shield",
          "upgrade_health_stealing_magic",
          "upgrade_titan_round",
          "upgrade_toxic_bullets",
          "upgrade_arcane_extension",
          "upgrade_spellslinger_headshots",
          "upgrade_tech_overflow",
          "upgrade_imbued_duration_extender",
          "upgrade_ethereal_bullets",
          "upgrade_infuser",
          "upgrade_boundless_spirit"
        ],
        "recommended_ability_order": [
          "ability_afterburn",
          "ability_flame_dash",
          "ability_incendiary_projectile",
          "ability_fire_bomb",
          "ability_flame_dash",
          "ability_flame_dash",
          "ability_incendiary_projectile",
          "ability_fire_bomb",
          "ability_afterburn",
          "ability_afterburn",
          "ability_afterburn",
          "ability_incendiary_projectile",
          "ability_incendiary_projectile",
          "ability_fire_bomb",
          "ability_flame_dash",
          "ability_fire_bomb"
        ],
        "player_selectable": true,
        "disabled": false,
        "in_development": false,
        "needs_testing": false,
        "assigned_players_only": false,
        "limited_testing": false,
        "complexity": 1,
        "skin": 0,
        "images": {
          "icon_hero_card": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/inferno_card.png",
          "icon_hero_card_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/inferno_card.webp",
          "icon_image_small": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/inferno_sm.png",
          "icon_image_small_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/inferno_sm.webp",
          "minimap_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/inferno_mm.png",
          "minimap_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/inferno_mm.webp",
          "selection_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/inferno.png",
          "selection_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/inferno.webp",
          "top_bar_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/inferno_hud.png",
          "top_bar_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/inferno_hud.webp"
        },
        "items": {
          "ability_climb_rope": "citadel_ability_climb_rope",
          "ability_innate1": "citadel_ability_dash",
          "ability_innate2": "citadel_ability_sprint",
          "ability_innate3": "citadel_ability_melee_parry",
          "ability_jump": "citadel_ability_jump",
          "ability_mantle": "citadel_ability_mantle",
          "ability_slide": "citadel_ability_slide",
          "ability_zip_line": "citadel_ability_zip_line",
          "ability_zip_line_boost": "citadel_ability_zipline_boost",
          "signature1": "ability_incendiary_projectile",
          "signature2": "ability_flame_dash",
          "signature3": "ability_afterburn",
          "signature4": "ability_fire_bomb",
          "weapon_melee": "ability_melee_inferno",
          "weapon_primary": "citadel_weapon_inferno_set"
        },
        "starting_stats": {
          "max_move_speed": {
            "value": 6.8,
            "display_stat_name": "EMaxMoveSpeed"
          },
          "sprint_speed": {
            "value": 2.0,
            "display_stat_name": "ESprintSpeed"
          },
          "crouch_speed": {
            "value": 4.75,
            "display_stat_name": "ECrouchSpeed"
          },
          "move_acceleration": {
            "value": 4.0,
            "display_stat_name": "EMoveAcceleration"
          },
          "light_melee_damage": {
            "value": 63,
            "display_stat_name": "ELightMeleeDamage"
          },
          "heavy_melee_damage": {
            "value": 116,
            "display_stat_name": "EHeavyMeleeDamage"
          },
          "max_health": {
            "value": 750,
            "display_stat_name": "EMaxHealth"
          },
          "weapon_power": {
            "value": 0,
            "display_stat_name": "EWeaponPower"
          },
          "reload_speed": {
            "value": 1,
            "display_stat_name": "EReloadSpeed"
          },
          "weapon_power_scale": {
            "value": 1,
            "display_stat_name": "EWeaponPowerScale"
          },
          "proc_build_up_rate_scale": {
            "value": 1,
            "display_stat_name": "EProcBuildUpRateScale"
          },
          "stamina": {
            "value": 3,
            "display_stat_name": "EStamina"
          },
          "base_health_regen": {
            "value": 2.0,
            "display_stat_name": "EBaseHealthRegen"
          },
          "stamina_regen_per_second": {
            "value": 0.2,
            "display_stat_name": "EStaminaRegenPerSecond"
          },
          "ability_resource_max": {
            "value": 0,
            "display_stat_name": "EAbilityResourceMax"
          },
          "ability_resource_regen_per_second": {
            "value": 0,
            "display_stat_name": "EAbilityResourceRegenPerSecond"
          },
          "crit_damage_received_scale": {
            "value": 1.0,
            "display_stat_name": "ECritDamageReceivedScale"
          },
          "tech_duration": {
            "value": 1,
            "display_stat_name": "ETechDuration"
          },
          "tech_range": {
            "value": 1,
            "display_stat_name": "ETechRange"
          }
        },
        "item_slot_info": {
          "spirit": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "vitality": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "weapon": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          }
        },
        "physics": {
          "collision_height": 80.0,
          "collision_radius": 20.0,
          "stealth_speed_meters_per_second": 4.0,
          "step_height": 32.0
        },
        "colors": {
          "glow_enemy": [
            255,
            0,
            0
          ],
          "glow_friendly": [
            255,
            239,
            215
          ],
          "glow_team1": [
            231,
            182,
            89
          ],
          "glow_team2": [
            91,
            121,
            230
          ],
          "ui": [
            255,
            70,
            45
          ]
        },
        "shop_stat_display": {
          "spirit_stats_display": {
            "display_stats": [
              "ETechCooldown",
              "ETechDuration",
              "ETechRange",
              "ETechLifesteal",
              "EMaxChargesIncrease",
              "ETechCooldownBetweenChargeUses"
            ]
          },
          "vitality_stats_display": {
            "display_stats": [
              "EMaxHealth",
              "EBaseHealthRegen",
              "EHealingOutput",
              "EOOCHealthRegen",
              "EBulletArmorDamageReduction",
              "ETechArmorDamageReduction",
              "EMeleeResist",
              "EDebuffResist",
              "ECritDamageReceivedScale"
            ],
            "other_display_stats": [
              "EMaxMoveSpeed",
              "ESprintSpeed",
              "EStaminaCooldown",
              "EStaminaRegenIncrease",
              "EStamina"
            ]
          },
          "weapon_stats_display": {
            "display_stats": [
              "EBulletDamage",
              "EBaseWeaponDamageIncrease",
              "ERoundsPerSecond",
              "EFireRate",
              "EClipSize",
              "EClipSizeIncrease",
              "EReloadTime",
              "EReloadSpeed",
              "EBulletSpeed",
              "EBulletSpeedIncrease",
              "EBulletLifesteal",
              "ECritDamageBonusScale"
            ],
            "other_display_stats": [
              "ELightMeleeDamage",
              "EHeavyMeleeDamage"
            ],
            "weapon_attributes": [
              "EWeaponAttribute_RapidFire",
              "EWeaponAttribute_MediumRange"
            ],
            "weapon_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/inferno_gun.png",
            "weapon_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/inferno_gun.webp"
          }
        },
        "cost_bonuses": {
          "spirit": [
            {
              "gold_threshold": 800,
              "bonus": 6.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 12.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 15.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 20.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 25.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 35.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 45.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 55.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 65.0,
              "percent_on_graph": 12.0
            }
          ],
          "vitality": [
            {
              "gold_threshold": 800,
              "bonus": 8.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 10.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 17.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 22.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 27.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 32.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 36.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 40.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 44.0,
              "percent_on_graph": 12.0
            }
          ],
          "weapon": [
            {
              "gold_threshold": 800,
              "bonus": 7.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 20.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 29.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 40.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 58.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 72.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 83.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 93.0,
              "percent_on_graph": 12.0
            }
          ]
        },
        "stats_display": {
          "health_header_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "health_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "magic_header_stats": [
            "ETechPower"
          ],
          "magic_stats": [
            "ETechCooldown",
            "ETechRange",
            "ETechDuration"
          ],
          "weapon_header_stats": [
            "EWeaponDPS",
            "EBulletDamage"
          ],
          "weapon_stats": [
            "ELightMeleeDamage",
            "EHeavyMeleeDamage",
            "EFireRate",
            "EClipSize"
          ]
        },
        "hero_stats_ui": {
          "weapon_stat_display": "EMeleeDamage_DEPRECATED",
          "display_stats": [
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxHealth"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBaseHealthRegen"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBulletArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ETechArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Spirit",
              "stat_type": "ETechPower"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EWeaponDPS"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EBulletDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EClipSize"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ERoundsPerSecond"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ELightMeleeDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EHeavyMeleeDamage"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxMoveSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ESprintSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EStamina"
            }
          ]
        },
        "level_info": {
          "1": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 0
          },
          "10": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 5200
          },
          "11": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6000
          },
          "12": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6800
          },
          "13": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 7600
          },
          "14": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 8400
          },
          "15": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 9200
          },
          "16": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 10000
          },
          "17": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 11000
          },
          "18": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 13000
          },
          "19": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 15000
          },
          "2": {
            "bonus_currencies": [
              "EAbilityPoints",
              "EAbilityUnlocks"
            ],
            "required_gold": 400
          },
          "20": {
            "use_standard_upgrade": true,
            "required_gold": 17000
          },
          "21": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 19000
          },
          "22": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 21000
          },
          "23": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 23000
          },
          "24": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 25000
          },
          "25": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 27000
          },
          "26": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 29000
          },
          "27": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 31000
          },
          "28": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 33000
          },
          "29": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 35000
          },
          "3": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 800
          },
          "30": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 37000
          },
          "31": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 39000
          },
          "32": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 41000
          },
          "33": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 43000
          },
          "34": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 44000
          },
          "35": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 45000
          },
          "36": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 46000
          },
          "37": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 47000
          },
          "4": {
            "use_standard_upgrade": true,
            "required_gold": 1200
          },
          "5": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 1500
          },
          "6": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 2200
          },
          "7": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 3000
          },
          "8": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 3500
          },
          "9": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 4500
          }
        },
        "scaling_stats": {},
        "purchase_bonuses": {
          "spirit": [
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 2,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 3,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 4,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 5,
              "value": "16"
            }
          ],
          "vitality": [
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 1,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 3,
              "value": "9"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 4,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 5,
              "value": "11"
            }
          ],
          "weapon": [
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 3,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 4,
              "value": "18"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 5,
              "value": "23"
            }
          ]
        },
        "standard_level_up_upgrades": {
          "MODIFIER_VALUE_BASE_BULLET_DAMAGE_FROM_LEVEL": 0.254571,
          "MODIFIER_VALUE_BASE_HEALTH_FROM_LEVEL": 62.0,
          "MODIFIER_VALUE_BASE_MELEE_DAMAGE_FROM_LEVEL": 2.53,
          "MODIFIER_VALUE_BOON_COUNT": 1.0,
          "MODIFIER_VALUE_BULLET_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_POWER": 2.0
        }
      },
      {
        "id": 2,
        "class_name": "hero_gigawatt",
        "name": "Seven",
        "description": {
          "lore": "When mystic energy awoke on Earth, the world changed... anything was possible.  But just because anything WAS possible, didn\u2019t mean that anything SHOULD be possible.  And so the government made rules.   Laws.  A means for US citizens to enjoy the benefits of the supernatural world in safety.  But rules and laws are for lesser men.  Men with limitations.  Men who were not Seven.  \n\nThere are many rumors about what Seven did to land himself in Lost Whisper, an oubliette for the most dangerous of occultists.  But there is no doubt about what happened on the night of his execution. \n\nWards placed by the most powerful ritualists of 7 different nations\u2026 wards designed to not just prevent mystical interference with the execution, but to simultaneously obliterate Seven's soul so that it could never be contacted, resurrected, or otherwise be used by someone looking to follow in his footsteps... failed.\n\nOnlookers viewed in horror as the strongest mentalist employed by the US Army\u2019s head popped like a grape.  They screamed as Scotland Yard\u2019s premiere occult investigator, the one who allegedly captured Seven, crumbled to ash.  Seven's body buckled and writhed against his restraints; his skin burning from eldritch electricity... and yet he would not die.  He laughed.\n\nHe laughed as he tore himself free from his bondage.\n\nHe laughed as his captors cowered in fear.\n\nHe laughed as he massacred his tormentors.\n\nHe laughed as he tasted the fresh air that was denied to him for years.\n\nAnd he laughed when he thought about what he was going to do once he reached New York City.",
          "role": "Electrocutes crowds of enemies",
          "playstyle": "Seven thrives in a skirmish waiting for the time to strike. Then he rolls into the fight like a storm and batters his enemies with a cascade of lightning."
        },
        "recommended_upgrades": [
          "upgrade_mystic_regeneration",
          "upgrade_clip_size",
          "upgrade_improved_spirit",
          "upgrade_tech_defense_shredders",
          "upgrade_fleetfoot_boots",
          "upgrade_crackshot",
          "upgrade_health_stealing_magic",
          "upgrade_magic_tempo",
          "upgrade_magic_reach",
          "upgrade_magic_shield",
          "upgrade_magic_storm",
          "upgrade_regenerating_bullet_shield",
          "upgrade_cardio_calibrator",
          "upgrade_magic_vulnerability",
          "upgrade_arcane_extension",
          "upgrade_boundless_spirit",
          "upgrade_tech_overflow",
          "upgrade_damage_recycler",
          "upgrade_magic_slow",
          "upgrade_unstoppable",
          "upgrade_escalating_exposure"
        ],
        "recommended_ability_order": [
          "citadel_ability_static_charge",
          "ability_power_surge",
          "citadel_ability_lightning_ball",
          "citadel_ability_storm_cloud",
          "citadel_ability_static_charge",
          "ability_power_surge",
          "ability_power_surge",
          "ability_power_surge",
          "citadel_ability_lightning_ball",
          "citadel_ability_storm_cloud",
          "citadel_ability_storm_cloud",
          "citadel_ability_storm_cloud",
          "citadel_ability_static_charge",
          "citadel_ability_static_charge",
          "citadel_ability_lightning_ball",
          "citadel_ability_lightning_ball"
        ],
        "player_selectable": true,
        "disabled": false,
        "in_development": false,
        "needs_testing": false,
        "assigned_players_only": false,
        "limited_testing": false,
        "complexity": 1,
        "skin": 0,
        "images": {
          "icon_hero_card": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/gigawatt_card.png",
          "icon_hero_card_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/gigawatt_card.webp",
          "icon_image_small": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/gigawatt_sm.png",
          "icon_image_small_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/gigawatt_sm.webp",
          "minimap_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/gigawatt_mm.png",
          "minimap_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/gigawatt_mm.webp",
          "selection_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/gigawatt.png",
          "selection_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/gigawatt.webp",
          "top_bar_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/gigwatt_hud.png",
          "top_bar_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/gigwatt_hud.webp"
        },
        "items": {
          "ability_climb_rope": "citadel_ability_climb_rope",
          "ability_innate1": "citadel_ability_dash",
          "ability_innate2": "citadel_ability_sprint",
          "ability_innate3": "citadel_ability_melee_parry",
          "ability_jump": "citadel_ability_jump",
          "ability_mantle": "citadel_ability_mantle",
          "ability_slide": "citadel_ability_slide",
          "ability_zip_line": "citadel_ability_zip_line",
          "ability_zip_line_boost": "citadel_ability_zipline_boost",
          "signature1": "citadel_ability_lightning_ball",
          "signature2": "citadel_ability_static_charge",
          "signature3": "ability_power_surge",
          "signature4": "citadel_ability_storm_cloud",
          "weapon_melee": "citadel_ability_melee_gigawatt",
          "weapon_primary": "citadel_weapon_gigawatt_set"
        },
        "starting_stats": {
          "max_move_speed": {
            "value": 7.1,
            "display_stat_name": "EMaxMoveSpeed"
          },
          "sprint_speed": {
            "value": 2.0,
            "display_stat_name": "ESprintSpeed"
          },
          "crouch_speed": {
            "value": 4.75,
            "display_stat_name": "ECrouchSpeed"
          },
          "move_acceleration": {
            "value": 4.0,
            "display_stat_name": "EMoveAcceleration"
          },
          "light_melee_damage": {
            "value": 63,
            "display_stat_name": "ELightMeleeDamage"
          },
          "heavy_melee_damage": {
            "value": 116,
            "display_stat_name": "EHeavyMeleeDamage"
          },
          "max_health": {
            "value": 700,
            "display_stat_name": "EMaxHealth"
          },
          "weapon_power": {
            "value": 0,
            "display_stat_name": "EWeaponPower"
          },
          "reload_speed": {
            "value": 1,
            "display_stat_name": "EReloadSpeed"
          },
          "weapon_power_scale": {
            "value": 1,
            "display_stat_name": "EWeaponPowerScale"
          },
          "proc_build_up_rate_scale": {
            "value": 1,
            "display_stat_name": "EProcBuildUpRateScale"
          },
          "stamina": {
            "value": 3,
            "display_stat_name": "EStamina"
          },
          "base_health_regen": {
            "value": 1.5,
            "display_stat_name": "EBaseHealthRegen"
          },
          "stamina_regen_per_second": {
            "value": 0.2,
            "display_stat_name": "EStaminaRegenPerSecond"
          },
          "ability_resource_max": {
            "value": 0,
            "display_stat_name": "EAbilityResourceMax"
          },
          "ability_resource_regen_per_second": {
            "value": 0,
            "display_stat_name": "EAbilityResourceRegenPerSecond"
          },
          "crit_damage_received_scale": {
            "value": 0.65,
            "display_stat_name": "ECritDamageReceivedScale"
          },
          "tech_duration": {
            "value": 1,
            "display_stat_name": "ETechDuration"
          },
          "tech_range": {
            "value": 1,
            "display_stat_name": "ETechRange"
          }
        },
        "item_slot_info": {
          "spirit": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "vitality": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "weapon": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          }
        },
        "physics": {
          "collision_height": 80.0,
          "collision_radius": 20.0,
          "stealth_speed_meters_per_second": 4.0,
          "step_height": 32.0
        },
        "colors": {
          "glow_enemy": [
            255,
            0,
            0
          ],
          "glow_friendly": [
            255,
            239,
            215
          ],
          "glow_team1": [
            231,
            182,
            89
          ],
          "glow_team2": [
            91,
            121,
            230
          ],
          "ui": [
            237,
            149,
            60
          ]
        },
        "shop_stat_display": {
          "spirit_stats_display": {
            "display_stats": [
              "ETechCooldown",
              "ETechDuration",
              "ETechRange",
              "ETechLifesteal",
              "EMaxChargesIncrease",
              "ETechCooldownBetweenChargeUses"
            ]
          },
          "vitality_stats_display": {
            "display_stats": [
              "EMaxHealth",
              "EBaseHealthRegen",
              "EHealingOutput",
              "EOOCHealthRegen",
              "EBulletArmorDamageReduction",
              "ETechArmorDamageReduction",
              "EMeleeResist",
              "EDebuffResist",
              "ECritDamageReceivedScale"
            ],
            "other_display_stats": [
              "EMaxMoveSpeed",
              "ESprintSpeed",
              "EStaminaCooldown",
              "EStaminaRegenIncrease",
              "EStamina"
            ]
          },
          "weapon_stats_display": {
            "display_stats": [
              "EBulletDamage",
              "EBaseWeaponDamageIncrease",
              "ERoundsPerSecond",
              "EFireRate",
              "EClipSize",
              "EClipSizeIncrease",
              "EReloadTime",
              "EReloadSpeed",
              "EBulletSpeed",
              "EBulletSpeedIncrease",
              "EBulletLifesteal",
              "ECritDamageBonusScale"
            ],
            "other_display_stats": [
              "ELightMeleeDamage",
              "EHeavyMeleeDamage"
            ],
            "weapon_attributes": [
              "EWeaponAttribute_BurstFire",
              "EWeaponAttribute_MediumRange"
            ],
            "weapon_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/gigawatt_gun.png",
            "weapon_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/gigawatt_gun.webp"
          }
        },
        "cost_bonuses": {
          "spirit": [
            {
              "gold_threshold": 800,
              "bonus": 6.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 12.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 15.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 20.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 25.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 35.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 45.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 55.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 65.0,
              "percent_on_graph": 12.0
            }
          ],
          "vitality": [
            {
              "gold_threshold": 800,
              "bonus": 8.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 10.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 17.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 22.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 27.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 32.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 36.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 40.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 44.0,
              "percent_on_graph": 12.0
            }
          ],
          "weapon": [
            {
              "gold_threshold": 800,
              "bonus": 7.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 20.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 29.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 40.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 58.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 72.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 83.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 93.0,
              "percent_on_graph": 12.0
            }
          ]
        },
        "stats_display": {
          "health_header_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "health_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "magic_header_stats": [
            "ETechPower"
          ],
          "magic_stats": [
            "ETechCooldown",
            "ETechRange",
            "ETechDuration"
          ],
          "weapon_header_stats": [
            "EWeaponDPS",
            "EBulletDamage"
          ],
          "weapon_stats": [
            "ELightMeleeDamage",
            "EHeavyMeleeDamage",
            "EFireRate",
            "EClipSize"
          ]
        },
        "hero_stats_ui": {
          "weapon_stat_display": "EMeleeDamage_DEPRECATED",
          "display_stats": [
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxHealth"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBaseHealthRegen"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBulletArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ETechArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Spirit",
              "stat_type": "ETechPower"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EWeaponDPS"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EBulletDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EClipSize"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ERoundsPerSecond"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ELightMeleeDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EHeavyMeleeDamage"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxMoveSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ESprintSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EStamina"
            }
          ]
        },
        "level_info": {
          "1": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 0
          },
          "10": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 5200
          },
          "11": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6000
          },
          "12": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6800
          },
          "13": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 7600
          },
          "14": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 8400
          },
          "15": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 9200
          },
          "16": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 10000
          },
          "17": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 11000
          },
          "18": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 13000
          },
          "19": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 15000
          },
          "2": {
            "bonus_currencies": [
              "EAbilityPoints",
              "EAbilityUnlocks"
            ],
            "required_gold": 400
          },
          "20": {
            "use_standard_upgrade": true,
            "required_gold": 17000
          },
          "21": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 19000
          },
          "22": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 21000
          },
          "23": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 23000
          },
          "24": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 25000
          },
          "25": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 27000
          },
          "26": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 29000
          },
          "27": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 31000
          },
          "28": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 33000
          },
          "29": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 35000
          },
          "3": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 800
          },
          "30": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 37000
          },
          "31": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 39000
          },
          "32": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 41000
          },
          "33": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 43000
          },
          "34": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 44000
          },
          "35": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 45000
          },
          "36": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 46000
          },
          "37": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 47000
          },
          "4": {
            "use_standard_upgrade": true,
            "required_gold": 1200
          },
          "5": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 1500
          },
          "6": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 2200
          },
          "7": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 3000
          },
          "8": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 3500
          },
          "9": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 4500
          }
        },
        "scaling_stats": {
          "EMaxMoveSpeed": {
            "scaling_stat": "ETechPower",
            "scale": 0.023
          }
        },
        "purchase_bonuses": {
          "spirit": [
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 2,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 3,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 4,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 5,
              "value": "16"
            }
          ],
          "vitality": [
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 1,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 3,
              "value": "9"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 4,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 5,
              "value": "11"
            }
          ],
          "weapon": [
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 3,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 4,
              "value": "18"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 5,
              "value": "23"
            }
          ]
        },
        "standard_level_up_upgrades": {
          "MODIFIER_VALUE_BASE_BULLET_DAMAGE_FROM_LEVEL": 0.537429,
          "MODIFIER_VALUE_BASE_HEALTH_FROM_LEVEL": 66.0,
          "MODIFIER_VALUE_BASE_MELEE_DAMAGE_FROM_LEVEL": 2.53,
          "MODIFIER_VALUE_BOON_COUNT": 1.0,
          "MODIFIER_VALUE_BULLET_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_POWER": 2.0
        }
      },
      {
        "id": 3,
        "class_name": "hero_hornet",
        "name": "Vindicta",
        "description": {
          "lore": "A victim of John Hathorne during the Salem Witch Trials, Vindicta got a second chance of life when her spirit was brought back to the mortal plane during the first Maelstrom (the event that introduced the supernatural to the public at large).\n\nWaging a one ghost war against \"The Friends of Humanity\", a neo inquisition formed by Hathorne's descendants; Vindicta looks to keep the supernatural safe from Hathorne's ilk, and she isn't afraid to stack as many bodies as needed to do it.",
          "role": "Snipes the unsuspecting",
          "playstyle": "Vindicta has the mobility to engage at her leisure, picking at her prey and bleeding them out slowly. Injured enemies at any distance should fear being picked off when she is on the map."
        },
        "recommended_upgrades": [
          "upgrade_mystic_regeneration",
          "upgrade_rapid_rounds",
          "upgrade_regenerating_bullet_shield",
          "upgrade_blitz_bullets",
          "upgrade_long_range",
          "upgrade_bullet_resist_shredder",
          "upgrade_extra_charge",
          "upgrade_improved_spirit",
          "upgrade_headshot_booster2",
          "upgrade_quick_silver",
          "upgrade_pristine_emblem",
          "upgrade_hollow_point_rounds",
          "upgrade_sharpshooter",
          "upgrade_soaring_spirit",
          "upgrade_chonky",
          "upgrade_banshee_slugs",
          "upgrade_aprounds",
          "upgrade_boundless_spirit",
          "upgrade_toxic_bullets",
          "upgrade_tech_overflow",
          "upgrade_ethereal_bullets"
        ],
        "recommended_ability_order": [
          "citadel_ability_hornet_sting",
          "citadel_ability_hornet_chain",
          "citadel_ability_hornet_leap",
          "citadel_ability_hornet_snipe",
          "citadel_ability_hornet_sting",
          "citadel_ability_hornet_sting",
          "citadel_ability_hornet_snipe",
          "citadel_ability_hornet_snipe",
          "citadel_ability_hornet_snipe",
          "citadel_ability_hornet_leap",
          "citadel_ability_hornet_chain",
          "citadel_ability_hornet_sting",
          "citadel_ability_hornet_leap",
          "citadel_ability_hornet_chain",
          "citadel_ability_hornet_leap",
          "citadel_ability_hornet_chain"
        ],
        "player_selectable": true,
        "disabled": false,
        "in_development": false,
        "needs_testing": false,
        "assigned_players_only": false,
        "limited_testing": false,
        "complexity": 1,
        "skin": 0,
        "images": {
          "icon_hero_card": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/hornet_card.png",
          "icon_hero_card_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/hornet_card.webp",
          "icon_image_small": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/hornet_sm.png",
          "icon_image_small_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/hornet_sm.webp",
          "minimap_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/hornet_mm.png",
          "minimap_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/hornet_mm.webp",
          "selection_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/hornet.png",
          "selection_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/hornet.webp",
          "top_bar_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/hornet_hud.png",
          "top_bar_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/hornet_hud.webp"
        },
        "items": {
          "ability_climb_rope": "citadel_ability_climb_rope",
          "ability_innate1": "citadel_ability_dash",
          "ability_innate2": "citadel_ability_sprint",
          "ability_innate3": "citadel_ability_melee_parry",
          "ability_jump": "citadel_ability_jump",
          "ability_mantle": "citadel_ability_mantle",
          "ability_slide": "citadel_ability_slide",
          "ability_zip_line": "citadel_ability_zip_line",
          "ability_zip_line_boost": "citadel_ability_zipline_boost",
          "signature1": "citadel_ability_hornet_chain",
          "signature2": "citadel_ability_hornet_leap",
          "signature3": "citadel_ability_hornet_sting",
          "signature4": "citadel_ability_hornet_snipe",
          "weapon_melee": "citadel_ability_melee_hornet",
          "weapon_primary": "citadel_weapon_hornet_set"
        },
        "starting_stats": {
          "max_move_speed": {
            "value": 8.0,
            "display_stat_name": "EMaxMoveSpeed"
          },
          "sprint_speed": {
            "value": 2.0,
            "display_stat_name": "ESprintSpeed"
          },
          "crouch_speed": {
            "value": 4.75,
            "display_stat_name": "ECrouchSpeed"
          },
          "move_acceleration": {
            "value": 4.0,
            "display_stat_name": "EMoveAcceleration"
          },
          "light_melee_damage": {
            "value": 63,
            "display_stat_name": "ELightMeleeDamage"
          },
          "heavy_melee_damage": {
            "value": 116,
            "display_stat_name": "EHeavyMeleeDamage"
          },
          "max_health": {
            "value": 675,
            "display_stat_name": "EMaxHealth"
          },
          "weapon_power": {
            "value": 0,
            "display_stat_name": "EWeaponPower"
          },
          "reload_speed": {
            "value": 1,
            "display_stat_name": "EReloadSpeed"
          },
          "weapon_power_scale": {
            "value": 1,
            "display_stat_name": "EWeaponPowerScale"
          },
          "proc_build_up_rate_scale": {
            "value": 1,
            "display_stat_name": "EProcBuildUpRateScale"
          },
          "stamina": {
            "value": 2,
            "display_stat_name": "EStamina"
          },
          "base_health_regen": {
            "value": 2.0,
            "display_stat_name": "EBaseHealthRegen"
          },
          "stamina_regen_per_second": {
            "value": 0.2,
            "display_stat_name": "EStaminaRegenPerSecond"
          },
          "ability_resource_max": {
            "value": 0,
            "display_stat_name": "EAbilityResourceMax"
          },
          "ability_resource_regen_per_second": {
            "value": 0,
            "display_stat_name": "EAbilityResourceRegenPerSecond"
          },
          "crit_damage_received_scale": {
            "value": 1.0,
            "display_stat_name": "ECritDamageReceivedScale"
          },
          "tech_duration": {
            "value": 1,
            "display_stat_name": "ETechDuration"
          },
          "tech_range": {
            "value": 1,
            "display_stat_name": "ETechRange"
          }
        },
        "item_slot_info": {
          "spirit": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "vitality": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "weapon": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          }
        },
        "physics": {
          "collision_height": 80.0,
          "collision_radius": 20.0,
          "stealth_speed_meters_per_second": 4.0,
          "step_height": 32.0
        },
        "colors": {
          "glow_enemy": [
            255,
            0,
            0
          ],
          "glow_friendly": [
            255,
            239,
            215
          ],
          "glow_team1": [
            231,
            182,
            89
          ],
          "glow_team2": [
            91,
            121,
            230
          ],
          "ui": [
            156,
            205,
            236
          ]
        },
        "shop_stat_display": {
          "spirit_stats_display": {
            "display_stats": [
              "ETechCooldown",
              "ETechDuration",
              "ETechRange",
              "ETechLifesteal",
              "EMaxChargesIncrease",
              "ETechCooldownBetweenChargeUses"
            ]
          },
          "vitality_stats_display": {
            "display_stats": [
              "EMaxHealth",
              "EBaseHealthRegen",
              "EHealingOutput",
              "EOOCHealthRegen",
              "EBulletArmorDamageReduction",
              "ETechArmorDamageReduction",
              "EMeleeResist",
              "EDebuffResist",
              "ECritDamageReceivedScale"
            ],
            "other_display_stats": [
              "EMaxMoveSpeed",
              "ESprintSpeed",
              "EStaminaCooldown",
              "EStaminaRegenIncrease",
              "EStamina"
            ]
          },
          "weapon_stats_display": {
            "display_stats": [
              "EBulletDamage",
              "EBaseWeaponDamageIncrease",
              "ERoundsPerSecond",
              "EFireRate",
              "EClipSize",
              "EClipSizeIncrease",
              "EReloadTime",
              "EReloadSpeed",
              "EBulletSpeed",
              "EBulletSpeedIncrease",
              "EBulletLifesteal",
              "ECritDamageBonusScale"
            ],
            "other_display_stats": [
              "ELightMeleeDamage",
              "EHeavyMeleeDamage"
            ],
            "weapon_attributes": [
              "EWeaponAttribute_RapidFire",
              "EWeaponAttribute_LongRange"
            ],
            "weapon_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/hornet_gun.png",
            "weapon_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/hornet_gun.webp"
          }
        },
        "cost_bonuses": {
          "spirit": [
            {
              "gold_threshold": 800,
              "bonus": 6.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 12.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 15.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 20.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 25.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 35.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 45.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 55.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 65.0,
              "percent_on_graph": 12.0
            }
          ],
          "vitality": [
            {
              "gold_threshold": 800,
              "bonus": 8.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 10.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 17.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 22.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 27.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 32.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 36.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 40.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 44.0,
              "percent_on_graph": 12.0
            }
          ],
          "weapon": [
            {
              "gold_threshold": 800,
              "bonus": 7.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 20.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 29.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 40.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 58.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 72.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 83.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 93.0,
              "percent_on_graph": 12.0
            }
          ]
        },
        "stats_display": {
          "health_header_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "health_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "magic_header_stats": [
            "ETechPower"
          ],
          "magic_stats": [
            "ETechCooldown",
            "ETechRange",
            "ETechDuration"
          ],
          "weapon_header_stats": [
            "EWeaponDPS",
            "EBulletDamage"
          ],
          "weapon_stats": [
            "ELightMeleeDamage",
            "EHeavyMeleeDamage",
            "EFireRate",
            "EClipSize"
          ]
        },
        "hero_stats_ui": {
          "weapon_stat_display": "EMeleeDamage_DEPRECATED",
          "display_stats": [
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxHealth"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBaseHealthRegen"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBulletArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ETechArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Spirit",
              "stat_type": "ETechPower"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EWeaponDPS"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EBulletDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EClipSize"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ERoundsPerSecond"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ELightMeleeDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EHeavyMeleeDamage"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxMoveSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ESprintSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EStamina"
            }
          ]
        },
        "level_info": {
          "1": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 0
          },
          "10": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 5200
          },
          "11": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6000
          },
          "12": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6800
          },
          "13": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 7600
          },
          "14": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 8400
          },
          "15": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 9200
          },
          "16": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 10000
          },
          "17": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 11000
          },
          "18": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 13000
          },
          "19": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 15000
          },
          "2": {
            "bonus_currencies": [
              "EAbilityPoints",
              "EAbilityUnlocks"
            ],
            "required_gold": 400
          },
          "20": {
            "use_standard_upgrade": true,
            "required_gold": 17000
          },
          "21": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 19000
          },
          "22": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 21000
          },
          "23": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 23000
          },
          "24": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 25000
          },
          "25": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 27000
          },
          "26": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 29000
          },
          "27": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 31000
          },
          "28": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 33000
          },
          "29": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 35000
          },
          "3": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 800
          },
          "30": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 37000
          },
          "31": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 39000
          },
          "32": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 41000
          },
          "33": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 43000
          },
          "34": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 44000
          },
          "35": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 45000
          },
          "36": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 46000
          },
          "37": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 47000
          },
          "4": {
            "use_standard_upgrade": true,
            "required_gold": 1200
          },
          "5": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 1500
          },
          "6": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 2200
          },
          "7": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 3000
          },
          "8": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 3500
          },
          "9": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 4500
          }
        },
        "scaling_stats": {
          "EFireRate": {
            "scaling_stat": "ETechPower",
            "scale": 0.14
          },
          "ERoundsPerSecond": {
            "scaling_stat": "ETechPower",
            "scale": 0.00636
          }
        },
        "purchase_bonuses": {
          "spirit": [
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 2,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 3,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 4,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 5,
              "value": "16"
            }
          ],
          "vitality": [
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 1,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 3,
              "value": "9"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 4,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 5,
              "value": "11"
            }
          ],
          "weapon": [
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 3,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 4,
              "value": "18"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 5,
              "value": "23"
            }
          ]
        },
        "standard_level_up_upgrades": {
          "MODIFIER_VALUE_BASE_BULLET_DAMAGE_FROM_LEVEL": 0.72,
          "MODIFIER_VALUE_BASE_HEALTH_FROM_LEVEL": 47.0,
          "MODIFIER_VALUE_BASE_MELEE_DAMAGE_FROM_LEVEL": 2.53,
          "MODIFIER_VALUE_BOON_COUNT": 1.0,
          "MODIFIER_VALUE_BULLET_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_POWER": 2.0
        }
      },
      {
        "id": 4,
        "class_name": "hero_ghost",
        "name": "Lady Geist",
        "description": {
          "lore": "Once, Lady Jeanne Geist was the toast of the town.  But as time passed and her beauty faded she found herself further and further from her glory days in High Society until finally she was nothing more than a frail woman in a nursing home, telling stories of a glorious past.  And that\u2019s when Oathkeeper revealed himself.  A powerful spirit from another plane, Oathkeeper offered her a path to reclaim her past glories\u2026 he could restore her youth; all she had to do was drain the essence of the living to sustain herself. \n\nGeist was torn.  Obviously murder was ghoulish business, and undoubtedly Oathkeeper was not an entity that could be trusted\u2026 but still, the thought of having a second chance of reliving her youth was too good to pass up.  And so she concocted a plan: after making a pact with Oathkeeper she would bind and ward him, limiting his influence and pull over her.  Oathkeeper would still get fed; but on her terms, not his.\n\nHowever, as years have turned to decades; the strength of the Ward has weakened, and Oathkeeper hungers more than he ever has in the past\u2026 ",
          "role": "Sacrifices health then drains it back",
          "playstyle": "Expending health to achieve devastating effects is the source of Lady Geist's power. When running low, she can drain the life out of her rivals."
        },
        "recommended_upgrades": [
          "upgrade_mystic_regeneration",
          "upgrade_magic_shield",
          "upgrade_improved_stamina",
          "upgrade_tech_defense_shredders",
          "upgrade_berserker",
          "upgrade_toxic_bullets",
          "upgrade_magic_vulnerability",
          "upgrade_warp_stone",
          "upgrade_debuff_reducer",
          "upgrade_reduce_debuff_duration",
          "upgrade_spellslinger_headshots",
          "upgrade_tech_purge",
          "upgrade_improved_bullet_armor",
          "upgrade_fervor",
          "upgrade_absorbing_armor",
          "upgrade_juggernaut",
          "upgrade_damage_recycler"
        ],
        "recommended_ability_order": [
          "ability_life_drain",
          "ability_blood_bomb",
          "ability_blood_shards",
          "ability_health_swap",
          "ability_life_drain",
          "ability_life_drain",
          "ability_blood_shards",
          "ability_life_drain",
          "ability_blood_shards",
          "ability_blood_bomb",
          "ability_blood_bomb",
          "ability_blood_bomb",
          "ability_health_swap",
          "ability_health_swap",
          "ability_health_swap",
          "ability_blood_shards"
        ],
        "player_selectable": true,
        "disabled": false,
        "in_development": false,
        "needs_testing": false,
        "assigned_players_only": false,
        "limited_testing": false,
        "complexity": 2,
        "skin": 0,
        "images": {
          "icon_hero_card": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/spectre_card.png",
          "icon_hero_card_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/spectre_card.webp",
          "icon_image_small": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/spectre_sm.png",
          "icon_image_small_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/spectre_sm.webp",
          "minimap_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/spectre_mm.png",
          "minimap_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/spectre_mm.webp",
          "selection_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/spectre.png",
          "selection_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/spectre.webp",
          "top_bar_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/spectre_hud.png",
          "top_bar_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/spectre_hud.webp"
        },
        "items": {
          "ability_climb_rope": "citadel_ability_climb_rope",
          "ability_innate1": "citadel_ability_dash",
          "ability_innate2": "citadel_ability_sprint",
          "ability_innate3": "citadel_ability_melee_parry",
          "ability_jump": "citadel_ability_jump",
          "ability_mantle": "citadel_ability_mantle",
          "ability_slide": "citadel_ability_slide",
          "ability_zip_line": "citadel_ability_zip_line",
          "ability_zip_line_boost": "citadel_ability_zipline_boost",
          "signature1": "ability_blood_bomb",
          "signature2": "ability_life_drain",
          "signature3": "ability_blood_shards",
          "signature4": "ability_health_swap",
          "weapon_melee": "ability_melee_ghost",
          "weapon_primary": "citadel_weapon_ghost_set"
        },
        "starting_stats": {
          "max_move_speed": {
            "value": 6.3,
            "display_stat_name": "EMaxMoveSpeed"
          },
          "sprint_speed": {
            "value": 3.0,
            "display_stat_name": "ESprintSpeed"
          },
          "crouch_speed": {
            "value": 4.75,
            "display_stat_name": "ECrouchSpeed"
          },
          "move_acceleration": {
            "value": 4.0,
            "display_stat_name": "EMoveAcceleration"
          },
          "light_melee_damage": {
            "value": 63,
            "display_stat_name": "ELightMeleeDamage"
          },
          "heavy_melee_damage": {
            "value": 116,
            "display_stat_name": "EHeavyMeleeDamage"
          },
          "max_health": {
            "value": 800,
            "display_stat_name": "EMaxHealth"
          },
          "weapon_power": {
            "value": 0,
            "display_stat_name": "EWeaponPower"
          },
          "reload_speed": {
            "value": 1,
            "display_stat_name": "EReloadSpeed"
          },
          "weapon_power_scale": {
            "value": 1,
            "display_stat_name": "EWeaponPowerScale"
          },
          "proc_build_up_rate_scale": {
            "value": 1,
            "display_stat_name": "EProcBuildUpRateScale"
          },
          "stamina": {
            "value": 3,
            "display_stat_name": "EStamina"
          },
          "base_health_regen": {
            "value": 1.0,
            "display_stat_name": "EBaseHealthRegen"
          },
          "stamina_regen_per_second": {
            "value": 0.2,
            "display_stat_name": "EStaminaRegenPerSecond"
          },
          "ability_resource_max": {
            "value": 0,
            "display_stat_name": "EAbilityResourceMax"
          },
          "ability_resource_regen_per_second": {
            "value": 0,
            "display_stat_name": "EAbilityResourceRegenPerSecond"
          },
          "crit_damage_received_scale": {
            "value": 1.0,
            "display_stat_name": "ECritDamageReceivedScale"
          },
          "tech_duration": {
            "value": 1,
            "display_stat_name": "ETechDuration"
          },
          "tech_range": {
            "value": 1,
            "display_stat_name": "ETechRange"
          }
        },
        "item_slot_info": {
          "spirit": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "vitality": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "weapon": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          }
        },
        "physics": {
          "collision_height": 80.0,
          "collision_radius": 20.0,
          "stealth_speed_meters_per_second": 4.0,
          "step_height": 32.0
        },
        "colors": {
          "glow_enemy": [
            255,
            0,
            0
          ],
          "glow_friendly": [
            255,
            239,
            215
          ],
          "glow_team1": [
            231,
            182,
            89
          ],
          "glow_team2": [
            91,
            121,
            230
          ],
          "ui": [
            9,
            137,
            89
          ]
        },
        "shop_stat_display": {
          "spirit_stats_display": {
            "display_stats": [
              "ETechCooldown",
              "ETechDuration",
              "ETechRange",
              "ETechLifesteal",
              "EMaxChargesIncrease",
              "ETechCooldownBetweenChargeUses"
            ]
          },
          "vitality_stats_display": {
            "display_stats": [
              "EMaxHealth",
              "EBaseHealthRegen",
              "EHealingOutput",
              "EOOCHealthRegen",
              "EBulletArmorDamageReduction",
              "ETechArmorDamageReduction",
              "EMeleeResist",
              "EDebuffResist",
              "ECritDamageReceivedScale"
            ],
            "other_display_stats": [
              "EMaxMoveSpeed",
              "ESprintSpeed",
              "EStaminaCooldown",
              "EStaminaRegenIncrease",
              "EStamina"
            ]
          },
          "weapon_stats_display": {
            "display_stats": [
              "EBulletDamage",
              "EBaseWeaponDamageIncrease",
              "ERoundsPerSecond",
              "EFireRate",
              "EClipSize",
              "EClipSizeIncrease",
              "EReloadTime",
              "EReloadSpeed",
              "EBulletSpeed",
              "EBulletSpeedIncrease",
              "EBulletLifesteal",
              "ECritDamageBonusScale"
            ],
            "other_display_stats": [
              "ELightMeleeDamage",
              "EHeavyMeleeDamage"
            ],
            "weapon_attributes": [
              "EWeaponAttribute_MediumRange",
              "EWeaponAttribute_HeavyHitter"
            ],
            "weapon_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/spectre_gun.png",
            "weapon_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/spectre_gun.webp"
          }
        },
        "cost_bonuses": {
          "spirit": [
            {
              "gold_threshold": 800,
              "bonus": 6.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 12.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 15.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 20.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 25.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 35.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 45.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 55.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 65.0,
              "percent_on_graph": 12.0
            }
          ],
          "vitality": [
            {
              "gold_threshold": 800,
              "bonus": 8.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 10.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 17.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 22.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 27.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 32.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 36.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 40.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 44.0,
              "percent_on_graph": 12.0
            }
          ],
          "weapon": [
            {
              "gold_threshold": 800,
              "bonus": 7.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 20.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 29.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 40.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 58.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 72.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 83.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 93.0,
              "percent_on_graph": 12.0
            }
          ]
        },
        "stats_display": {
          "health_header_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "health_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "magic_header_stats": [
            "ETechPower"
          ],
          "magic_stats": [
            "ETechCooldown",
            "ETechRange",
            "ETechDuration"
          ],
          "weapon_header_stats": [
            "EWeaponDPS",
            "EBulletDamage"
          ],
          "weapon_stats": [
            "ELightMeleeDamage",
            "EHeavyMeleeDamage",
            "EFireRate",
            "EClipSize"
          ]
        },
        "hero_stats_ui": {
          "weapon_stat_display": "EMeleeDamage_DEPRECATED",
          "display_stats": [
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxHealth"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBaseHealthRegen"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBulletArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ETechArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Spirit",
              "stat_type": "ETechPower"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EWeaponDPS"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EBulletDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EClipSize"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ERoundsPerSecond"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ELightMeleeDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EHeavyMeleeDamage"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxMoveSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ESprintSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EStamina"
            }
          ]
        },
        "level_info": {
          "1": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 0
          },
          "10": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 5200
          },
          "11": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6000
          },
          "12": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6800
          },
          "13": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 7600
          },
          "14": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 8400
          },
          "15": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 9200
          },
          "16": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 10000
          },
          "17": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 11000
          },
          "18": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 13000
          },
          "19": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 15000
          },
          "2": {
            "bonus_currencies": [
              "EAbilityPoints",
              "EAbilityUnlocks"
            ],
            "required_gold": 400
          },
          "20": {
            "use_standard_upgrade": true,
            "required_gold": 17000
          },
          "21": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 19000
          },
          "22": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 21000
          },
          "23": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 23000
          },
          "24": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 25000
          },
          "25": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 27000
          },
          "26": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 29000
          },
          "27": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 31000
          },
          "28": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 33000
          },
          "29": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 35000
          },
          "3": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 800
          },
          "30": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 37000
          },
          "31": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 39000
          },
          "32": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 41000
          },
          "33": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 43000
          },
          "34": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 44000
          },
          "35": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 45000
          },
          "36": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 46000
          },
          "37": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 47000
          },
          "4": {
            "use_standard_upgrade": true,
            "required_gold": 1200
          },
          "5": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 1500
          },
          "6": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 2200
          },
          "7": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 3000
          },
          "8": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 3500
          },
          "9": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 4500
          }
        },
        "scaling_stats": {},
        "purchase_bonuses": {
          "spirit": [
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 2,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 3,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 4,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 5,
              "value": "16"
            }
          ],
          "vitality": [
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 1,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 3,
              "value": "9"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 4,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 5,
              "value": "11"
            }
          ],
          "weapon": [
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 3,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 4,
              "value": "18"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 5,
              "value": "23"
            }
          ]
        },
        "standard_level_up_upgrades": {
          "MODIFIER_VALUE_BASE_BULLET_DAMAGE_FROM_LEVEL": 1.38,
          "MODIFIER_VALUE_BASE_HEALTH_FROM_LEVEL": 82.0,
          "MODIFIER_VALUE_BASE_MELEE_DAMAGE_FROM_LEVEL": 2.53,
          "MODIFIER_VALUE_BOON_COUNT": 1.0,
          "MODIFIER_VALUE_BULLET_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_POWER": 2.0
        }
      },
      {
        "id": 6,
        "class_name": "hero_atlas",
        "name": "Abrams",
        "description": {
          "lore": "Hard hitting, hard headed, and hard drinking; Detective Abrams has been a fixture on the New York investigating scene for years.  From stolen art, to missing persons, to ritual murders; Abrams didn't just take any case that came across his desk... he solved them.\n\nBut his days of following cheating spouses came to an end the day he opened his office door and found The Tome sitting on his desk.\n\nNo instruction was left for him save for a brief note scrawled in onyx blood that read \"Don't let them have it\".  Abrams hasn't figured where the thing came from; but seeing as his home has been broken into, his office tossed on 3 different occasions, and his car firebombed he has a vested interest in figuring out what the hell is going on.",
          "role": "Charges into close combat",
          "playstyle": "Abrams has the bulk and sustain to lead from the front, often running into the middle of his foes and watching them scatter. If his enemies waste their fire on him, his backline teammates can lay out damage with impunity."
        },
        "recommended_upgrades": [
          "upgrade_endurance",
          "upgrade_close_range",
          "upgrade_lifestrike_gauntlets",
          "upgrade_acolytes_glove",
          "upgrade_melee_charge",
          "upgrade_kinetic_sash",
          "upgrade_berserker",
          "upgrade_return_fire",
          "upgrade_cardio_calibrator",
          "upgrade_close_quarter_combat",
          "upgrade_improved_bullet_armor",
          "upgrade_tech_purge",
          "upgrade_bullet_armor_reduction_aura",
          "upgrade_fervor",
          "upgrade_phantom_strike",
          "upgrade_crushing_fists",
          "upgrade_juggernaut",
          "upgrade_colossus"
        ],
        "recommended_ability_order": [
          "citadel_ability_bull_charge",
          "citadel_ability_bull_heal",
          "citadel_ability_passive_beefy",
          "citadel_ability_bull_leap",
          "citadel_ability_bull_charge",
          "citadel_ability_bull_heal",
          "citadel_ability_bull_charge",
          "citadel_ability_bull_heal",
          "citadel_ability_bull_leap",
          "citadel_ability_bull_heal",
          "citadel_ability_passive_beefy",
          "citadel_ability_passive_beefy",
          "citadel_ability_passive_beefy",
          "citadel_ability_bull_charge",
          "citadel_ability_bull_leap",
          "citadel_ability_bull_leap"
        ],
        "player_selectable": true,
        "disabled": false,
        "in_development": false,
        "needs_testing": false,
        "assigned_players_only": false,
        "limited_testing": false,
        "complexity": 1,
        "skin": 0,
        "images": {
          "icon_hero_card": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/bull_card.png",
          "icon_hero_card_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/bull_card.webp",
          "icon_image_small": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/bull_sm.png",
          "icon_image_small_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/bull_sm.webp",
          "minimap_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/bull_mm.png",
          "minimap_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/bull_mm.webp",
          "selection_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/bull.png",
          "selection_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/bull.webp",
          "top_bar_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/bull_hud.png",
          "top_bar_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/bull_hud.webp"
        },
        "items": {
          "ability_climb_rope": "citadel_ability_climb_rope",
          "ability_innate1": "citadel_ability_dash",
          "ability_innate2": "citadel_ability_sprint",
          "ability_innate3": "citadel_ability_melee_parry",
          "ability_jump": "citadel_ability_jump",
          "ability_mantle": "citadel_ability_mantle",
          "ability_slide": "citadel_ability_slide",
          "ability_zip_line": "citadel_ability_zip_line",
          "ability_zip_line_boost": "citadel_ability_zipline_boost",
          "signature1": "citadel_ability_bull_heal",
          "signature2": "citadel_ability_bull_charge",
          "signature3": "citadel_ability_passive_beefy",
          "signature4": "citadel_ability_bull_leap",
          "weapon_melee": "citadel_ability_melee_bull",
          "weapon_primary": "citadel_weapon_bull_set"
        },
        "starting_stats": {
          "max_move_speed": {
            "value": 6.5,
            "display_stat_name": "EMaxMoveSpeed"
          },
          "sprint_speed": {
            "value": 2.0,
            "display_stat_name": "ESprintSpeed"
          },
          "crouch_speed": {
            "value": 4.75,
            "display_stat_name": "ECrouchSpeed"
          },
          "move_acceleration": {
            "value": 4.0,
            "display_stat_name": "EMoveAcceleration"
          },
          "light_melee_damage": {
            "value": 63,
            "display_stat_name": "ELightMeleeDamage"
          },
          "heavy_melee_damage": {
            "value": 116,
            "display_stat_name": "EHeavyMeleeDamage"
          },
          "max_health": {
            "value": 720,
            "display_stat_name": "EMaxHealth"
          },
          "weapon_power": {
            "value": 0,
            "display_stat_name": "EWeaponPower"
          },
          "reload_speed": {
            "value": 1,
            "display_stat_name": "EReloadSpeed"
          },
          "weapon_power_scale": {
            "value": 1,
            "display_stat_name": "EWeaponPowerScale"
          },
          "proc_build_up_rate_scale": {
            "value": 1,
            "display_stat_name": "EProcBuildUpRateScale"
          },
          "stamina": {
            "value": 3,
            "display_stat_name": "EStamina"
          },
          "base_health_regen": {
            "value": 1.5,
            "display_stat_name": "EBaseHealthRegen"
          },
          "stamina_regen_per_second": {
            "value": 0.2,
            "display_stat_name": "EStaminaRegenPerSecond"
          },
          "ability_resource_max": {
            "value": 0,
            "display_stat_name": "EAbilityResourceMax"
          },
          "ability_resource_regen_per_second": {
            "value": 0,
            "display_stat_name": "EAbilityResourceRegenPerSecond"
          },
          "crit_damage_received_scale": {
            "value": 1.0,
            "display_stat_name": "ECritDamageReceivedScale"
          },
          "tech_duration": {
            "value": 1,
            "display_stat_name": "ETechDuration"
          },
          "tech_range": {
            "value": 1,
            "display_stat_name": "ETechRange"
          }
        },
        "item_slot_info": {
          "spirit": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "vitality": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "weapon": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          }
        },
        "physics": {
          "collision_height": 80.0,
          "collision_radius": 20.0,
          "stealth_speed_meters_per_second": 4.0,
          "step_height": 32.0
        },
        "colors": {
          "glow_enemy": [
            255,
            0,
            0
          ],
          "glow_friendly": [
            255,
            239,
            215
          ],
          "glow_team1": [
            231,
            182,
            89
          ],
          "glow_team2": [
            91,
            121,
            230
          ],
          "ui": [
            32,
            146,
            174
          ]
        },
        "shop_stat_display": {
          "spirit_stats_display": {
            "display_stats": [
              "ETechCooldown",
              "ETechDuration",
              "ETechRange",
              "ETechLifesteal",
              "EMaxChargesIncrease",
              "ETechCooldownBetweenChargeUses"
            ]
          },
          "vitality_stats_display": {
            "display_stats": [
              "EMaxHealth",
              "EBaseHealthRegen",
              "EHealingOutput",
              "EOOCHealthRegen",
              "EBulletArmorDamageReduction",
              "ETechArmorDamageReduction",
              "EMeleeResist",
              "EDebuffResist",
              "ECritDamageReceivedScale"
            ],
            "other_display_stats": [
              "EMaxMoveSpeed",
              "ESprintSpeed",
              "EStaminaCooldown",
              "EStaminaRegenIncrease",
              "EStamina"
            ]
          },
          "weapon_stats_display": {
            "display_stats": [
              "EBulletDamage",
              "EBaseWeaponDamageIncrease",
              "ERoundsPerSecond",
              "EFireRate",
              "EClipSize",
              "EClipSizeIncrease",
              "EReloadTime",
              "EReloadSpeed",
              "EBulletSpeed",
              "EBulletSpeedIncrease",
              "EBulletLifesteal",
              "ECritDamageBonusScale"
            ],
            "other_display_stats": [
              "ELightMeleeDamage",
              "EHeavyMeleeDamage"
            ],
            "weapon_attributes": [
              "EWeaponAttribute_Spreadshot",
              "EWeaponAttribute_CloseRange"
            ],
            "weapon_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/bull_gun.png",
            "weapon_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/bull_gun.webp"
          }
        },
        "cost_bonuses": {
          "spirit": [
            {
              "gold_threshold": 800,
              "bonus": 6.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 12.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 15.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 20.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 25.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 35.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 45.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 55.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 65.0,
              "percent_on_graph": 12.0
            }
          ],
          "vitality": [
            {
              "gold_threshold": 800,
              "bonus": 8.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 10.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 17.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 22.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 27.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 32.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 36.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 40.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 44.0,
              "percent_on_graph": 12.0
            }
          ],
          "weapon": [
            {
              "gold_threshold": 800,
              "bonus": 7.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 20.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 29.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 40.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 58.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 72.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 83.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 93.0,
              "percent_on_graph": 12.0
            }
          ]
        },
        "stats_display": {
          "health_header_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "health_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "magic_header_stats": [
            "ETechPower"
          ],
          "magic_stats": [
            "ETechCooldown",
            "ETechRange",
            "ETechDuration"
          ],
          "weapon_header_stats": [
            "EWeaponDPS",
            "EBulletDamage"
          ],
          "weapon_stats": [
            "ELightMeleeDamage",
            "EHeavyMeleeDamage",
            "EFireRate",
            "EClipSize"
          ]
        },
        "hero_stats_ui": {
          "weapon_stat_display": "EMeleeDamage_DEPRECATED",
          "display_stats": [
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxHealth"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBaseHealthRegen"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBulletArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ETechArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Spirit",
              "stat_type": "ETechPower"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EWeaponDPS"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EBulletDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EClipSize"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ERoundsPerSecond"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ELightMeleeDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EHeavyMeleeDamage"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxMoveSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ESprintSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EStamina"
            }
          ]
        },
        "level_info": {
          "1": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 0
          },
          "10": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 5200
          },
          "11": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6000
          },
          "12": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6800
          },
          "13": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 7600
          },
          "14": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 8400
          },
          "15": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 9200
          },
          "16": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 10000
          },
          "17": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 11000
          },
          "18": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 13000
          },
          "19": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 15000
          },
          "2": {
            "bonus_currencies": [
              "EAbilityPoints",
              "EAbilityUnlocks"
            ],
            "required_gold": 400
          },
          "20": {
            "use_standard_upgrade": true,
            "required_gold": 17000
          },
          "21": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 19000
          },
          "22": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 21000
          },
          "23": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 23000
          },
          "24": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 25000
          },
          "25": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 27000
          },
          "26": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 29000
          },
          "27": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 31000
          },
          "28": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 33000
          },
          "29": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 35000
          },
          "3": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 800
          },
          "30": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 37000
          },
          "31": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 39000
          },
          "32": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 41000
          },
          "33": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 43000
          },
          "34": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 44000
          },
          "35": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 45000
          },
          "36": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 46000
          },
          "37": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 47000
          },
          "4": {
            "use_standard_upgrade": true,
            "required_gold": 1200
          },
          "5": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 1500
          },
          "6": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 2200
          },
          "7": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 3000
          },
          "8": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 3500
          },
          "9": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 4500
          }
        },
        "scaling_stats": {},
        "purchase_bonuses": {
          "spirit": [
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 2,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 3,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 4,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 5,
              "value": "16"
            }
          ],
          "vitality": [
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 1,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 3,
              "value": "9"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 4,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 5,
              "value": "11"
            }
          ],
          "weapon": [
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 3,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 4,
              "value": "18"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 5,
              "value": "23"
            }
          ]
        },
        "standard_level_up_upgrades": {
          "MODIFIER_VALUE_BASE_BULLET_DAMAGE_FROM_LEVEL": 0.226286,
          "MODIFIER_VALUE_BASE_HEALTH_FROM_LEVEL": 78.0,
          "MODIFIER_VALUE_BASE_MELEE_DAMAGE_FROM_LEVEL": 2.53,
          "MODIFIER_VALUE_BOON_COUNT": 1.0,
          "MODIFIER_VALUE_BULLET_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_POWER": 2.0
        }
      },
      {
        "id": 7,
        "class_name": "hero_wraith",
        "name": "Wraith",
        "description": {
          "lore": "The cornerstone of the New York gambling scene, Wraith's organization is about as open a secret as it comes.  However, thanks to a non-trivial amount of bribes, shakedowns, and blackmail, Wraith knows that she's above the law.",
          "role": "Melts isolated targets",
          "playstyle": "Excelling at one-on-one combat, Wraith isolates targets, eliminating them with ruthless efficiency. Then teleporting away before anyone can retaliate."
        },
        "recommended_upgrades": [
          "upgrade_endurance",
          "upgrade_rapid_rounds",
          "upgrade_clip_size",
          "upgrade_extra_charge",
          "upgrade_regenerating_bullet_shield",
          "upgrade_quick_silver",
          "upgrade_improved_spirit",
          "upgrade_blitz_bullets",
          "upgrade_chain_lightning",
          "upgrade_titan_round",
          "upgrade_chonky",
          "upgrade_magic_storm",
          "upgrade_soaring_spirit",
          "upgrade_hollow_point_rounds",
          "upgrade_boundless_spirit",
          "upgrade_enchanted_holsters",
          "upgrade_glass_cannon",
          "upgrade_critshot"
        ],
        "recommended_ability_order": [
          "citadel_ability_card_toss",
          "citadel_ability_wraith_rapidfire",
          "citadel_ability_projectmind",
          "citadel_ability_psychic_lift",
          "citadel_ability_card_toss",
          "citadel_ability_card_toss",
          "citadel_ability_wraith_rapidfire",
          "citadel_ability_wraith_rapidfire",
          "citadel_ability_projectmind",
          "citadel_ability_psychic_lift",
          "citadel_ability_wraith_rapidfire",
          "citadel_ability_projectmind",
          "citadel_ability_projectmind",
          "citadel_ability_psychic_lift",
          "citadel_ability_psychic_lift",
          "citadel_ability_card_toss"
        ],
        "player_selectable": true,
        "disabled": false,
        "in_development": false,
        "needs_testing": false,
        "assigned_players_only": false,
        "limited_testing": false,
        "complexity": 1,
        "skin": 1,
        "images": {
          "icon_hero_card": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/wraith_card.png",
          "icon_hero_card_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/wraith_card.webp",
          "icon_image_small": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/wraith_sm.png",
          "icon_image_small_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/wraith_sm.webp",
          "minimap_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/wraith_mm.png",
          "minimap_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/wraith_mm.webp",
          "selection_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/wraith.png",
          "selection_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/wraith.webp",
          "top_bar_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/wraith_hud.png",
          "top_bar_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/wraith_hud.webp"
        },
        "items": {
          "ability_climb_rope": "citadel_ability_climb_rope",
          "ability_innate1": "citadel_ability_dash",
          "ability_innate2": "citadel_ability_sprint",
          "ability_innate3": "citadel_ability_melee_parry",
          "ability_jump": "citadel_ability_jump",
          "ability_mantle": "citadel_ability_mantle",
          "ability_slide": "citadel_ability_slide",
          "ability_zip_line": "citadel_ability_zip_line",
          "ability_zip_line_boost": "citadel_ability_zipline_boost",
          "signature1": "citadel_ability_card_toss",
          "signature2": "citadel_ability_projectmind",
          "signature3": "citadel_ability_wraith_rapidfire",
          "signature4": "citadel_ability_psychic_lift",
          "weapon_melee": "citadel_ability_melee_wraith",
          "weapon_primary": "citadel_weapon_wraith_set"
        },
        "starting_stats": {
          "max_move_speed": {
            "value": 7.3,
            "display_stat_name": "EMaxMoveSpeed"
          },
          "sprint_speed": {
            "value": 2.0,
            "display_stat_name": "ESprintSpeed"
          },
          "crouch_speed": {
            "value": 4.75,
            "display_stat_name": "ECrouchSpeed"
          },
          "move_acceleration": {
            "value": 4.0,
            "display_stat_name": "EMoveAcceleration"
          },
          "light_melee_damage": {
            "value": 63,
            "display_stat_name": "ELightMeleeDamage"
          },
          "heavy_melee_damage": {
            "value": 116,
            "display_stat_name": "EHeavyMeleeDamage"
          },
          "max_health": {
            "value": 700,
            "display_stat_name": "EMaxHealth"
          },
          "weapon_power": {
            "value": 0,
            "display_stat_name": "EWeaponPower"
          },
          "reload_speed": {
            "value": 1,
            "display_stat_name": "EReloadSpeed"
          },
          "weapon_power_scale": {
            "value": 1,
            "display_stat_name": "EWeaponPowerScale"
          },
          "proc_build_up_rate_scale": {
            "value": 1,
            "display_stat_name": "EProcBuildUpRateScale"
          },
          "stamina": {
            "value": 3,
            "display_stat_name": "EStamina"
          },
          "base_health_regen": {
            "value": 2.0,
            "display_stat_name": "EBaseHealthRegen"
          },
          "stamina_regen_per_second": {
            "value": 0.2,
            "display_stat_name": "EStaminaRegenPerSecond"
          },
          "ability_resource_max": {
            "value": 0,
            "display_stat_name": "EAbilityResourceMax"
          },
          "ability_resource_regen_per_second": {
            "value": 0,
            "display_stat_name": "EAbilityResourceRegenPerSecond"
          },
          "crit_damage_received_scale": {
            "value": 1.0,
            "display_stat_name": "ECritDamageReceivedScale"
          },
          "tech_duration": {
            "value": 1,
            "display_stat_name": "ETechDuration"
          },
          "tech_range": {
            "value": 1,
            "display_stat_name": "ETechRange"
          }
        },
        "item_slot_info": {
          "spirit": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "vitality": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "weapon": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          }
        },
        "physics": {
          "collision_height": 80.0,
          "collision_radius": 20.0,
          "stealth_speed_meters_per_second": 4.0,
          "step_height": 32.0
        },
        "colors": {
          "glow_enemy": [
            255,
            0,
            0
          ],
          "glow_friendly": [
            255,
            239,
            215
          ],
          "glow_team1": [
            231,
            182,
            89
          ],
          "glow_team2": [
            91,
            121,
            230
          ],
          "ui": [
            148,
            77,
            120
          ]
        },
        "shop_stat_display": {
          "spirit_stats_display": {
            "display_stats": [
              "ETechCooldown",
              "ETechDuration",
              "ETechRange",
              "ETechLifesteal",
              "EMaxChargesIncrease",
              "ETechCooldownBetweenChargeUses"
            ]
          },
          "vitality_stats_display": {
            "display_stats": [
              "EMaxHealth",
              "EBaseHealthRegen",
              "EHealingOutput",
              "EOOCHealthRegen",
              "EBulletArmorDamageReduction",
              "ETechArmorDamageReduction",
              "EMeleeResist",
              "EDebuffResist",
              "ECritDamageReceivedScale"
            ],
            "other_display_stats": [
              "EMaxMoveSpeed",
              "ESprintSpeed",
              "EStaminaCooldown",
              "EStaminaRegenIncrease",
              "EStamina"
            ]
          },
          "weapon_stats_display": {
            "display_stats": [
              "EBulletDamage",
              "EBaseWeaponDamageIncrease",
              "ERoundsPerSecond",
              "EFireRate",
              "EClipSize",
              "EClipSizeIncrease",
              "EReloadTime",
              "EReloadSpeed",
              "EBulletSpeed",
              "EBulletSpeedIncrease",
              "EBulletLifesteal",
              "ECritDamageBonusScale"
            ],
            "other_display_stats": [
              "ELightMeleeDamage",
              "EHeavyMeleeDamage"
            ],
            "weapon_attributes": [
              "EWeaponAttribute_RapidFire",
              "EWeaponAttribute_MediumRange"
            ],
            "weapon_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/wraith_gun.png",
            "weapon_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/wraith_gun.webp"
          }
        },
        "cost_bonuses": {
          "spirit": [
            {
              "gold_threshold": 800,
              "bonus": 6.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 12.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 15.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 20.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 25.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 35.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 45.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 55.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 65.0,
              "percent_on_graph": 12.0
            }
          ],
          "vitality": [
            {
              "gold_threshold": 800,
              "bonus": 8.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 10.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 17.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 22.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 27.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 32.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 36.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 40.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 44.0,
              "percent_on_graph": 12.0
            }
          ],
          "weapon": [
            {
              "gold_threshold": 800,
              "bonus": 7.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 20.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 29.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 40.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 58.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 72.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 83.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 93.0,
              "percent_on_graph": 12.0
            }
          ]
        },
        "stats_display": {
          "health_header_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "health_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "magic_header_stats": [
            "ETechPower"
          ],
          "magic_stats": [
            "ETechCooldown",
            "ETechRange",
            "ETechDuration"
          ],
          "weapon_header_stats": [
            "EWeaponDPS",
            "EBulletDamage"
          ],
          "weapon_stats": [
            "ELightMeleeDamage",
            "EHeavyMeleeDamage",
            "EFireRate",
            "EClipSize"
          ]
        },
        "hero_stats_ui": {
          "weapon_stat_display": "EMeleeDamage_DEPRECATED",
          "display_stats": [
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxHealth"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBaseHealthRegen"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBulletArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ETechArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Spirit",
              "stat_type": "ETechPower"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EWeaponDPS"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EBulletDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EClipSize"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ERoundsPerSecond"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ELightMeleeDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EHeavyMeleeDamage"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxMoveSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ESprintSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EStamina"
            }
          ]
        },
        "level_info": {
          "1": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 0
          },
          "10": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 5200
          },
          "11": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6000
          },
          "12": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6800
          },
          "13": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 7600
          },
          "14": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 8400
          },
          "15": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 9200
          },
          "16": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 10000
          },
          "17": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 11000
          },
          "18": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 13000
          },
          "19": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 15000
          },
          "2": {
            "bonus_currencies": [
              "EAbilityPoints",
              "EAbilityUnlocks"
            ],
            "required_gold": 400
          },
          "20": {
            "use_standard_upgrade": true,
            "required_gold": 17000
          },
          "21": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 19000
          },
          "22": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 21000
          },
          "23": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 23000
          },
          "24": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 25000
          },
          "25": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 27000
          },
          "26": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 29000
          },
          "27": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 31000
          },
          "28": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 33000
          },
          "29": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 35000
          },
          "3": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 800
          },
          "30": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 37000
          },
          "31": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 39000
          },
          "32": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 41000
          },
          "33": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 43000
          },
          "34": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 44000
          },
          "35": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 45000
          },
          "36": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 46000
          },
          "37": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 47000
          },
          "4": {
            "use_standard_upgrade": true,
            "required_gold": 1200
          },
          "5": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 1500
          },
          "6": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 2200
          },
          "7": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 3000
          },
          "8": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 3500
          },
          "9": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 4500
          }
        },
        "scaling_stats": {
          "ESprintSpeed": {
            "scaling_stat": "ETechPower",
            "scale": 0.06
          }
        },
        "purchase_bonuses": {
          "spirit": [
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 2,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 3,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 4,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 5,
              "value": "16"
            }
          ],
          "vitality": [
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 1,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 3,
              "value": "9"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 4,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 5,
              "value": "11"
            }
          ],
          "weapon": [
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 3,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 4,
              "value": "18"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 5,
              "value": "23"
            }
          ]
        },
        "standard_level_up_upgrades": {
          "MODIFIER_VALUE_BASE_BULLET_DAMAGE_FROM_LEVEL": 0.351,
          "MODIFIER_VALUE_BASE_HEALTH_FROM_LEVEL": 57.0,
          "MODIFIER_VALUE_BASE_MELEE_DAMAGE_FROM_LEVEL": 2.53,
          "MODIFIER_VALUE_BOON_COUNT": 1.0,
          "MODIFIER_VALUE_BULLET_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_POWER": 2.0
        }
      },
      {
        "id": 8,
        "class_name": "hero_forge",
        "name": "McGinnis",
        "description": {
          "lore": "Maggie McGinnis always had a knack for building things.  At 4 she was using Lincoln Logs to recreate architectural marvels.  At 10 she built and rewired a custom light fixture for her parent's anniversary.  At 15 she designed a machine that refined the souls of the dead...that last one got a little more attention than the Lincoln Logs.\n\nNow the head of Fairfax Industries Military R&D department, McGinnis spends her time in the machine shop, not in a lab.  She's not interested in theory, to her science is magic you can touch.",
          "role": "Controls the battle with combat turrets",
          "playstyle": "Precise placement is everything for McGinnis, whether she's creating a killzone or splitting the enemy team. She can help keep her team running making them hard to dislodge when entrenched."
        },
        "recommended_upgrades": [
          "upgrade_extra_charge",
          "upgrade_rapid_rounds",
          "upgrade_sprint_booster",
          "upgrade_improved_spirit",
          "upgrade_magic_reach",
          "upgrade_trophy_collector",
          "upgrade_fleetfoot_boots",
          "upgrade_magic_tempo",
          "upgrade_regenerating_bullet_shield",
          "upgrade_magic_vulnerability",
          "upgrade_rapid_recharge",
          "upgrade_magic_slow",
          "upgrade_healing_booster",
          "upgrade_soaring_spirit",
          "upgrade_arcane_extension",
          "upgrade_dps_aura",
          "upgrade_suppressor",
          "upgrade_intensifying_clip",
          "upgrade_cooldown_reduction",
          "upgrade_ability_power_shard",
          "upgrade_tech_range",
          "upgrade_ultimate_burst",
          "upgrade_healbuff",
          "upgrade_boundless_spirit",
          "upgrade_escalating_exposure"
        ],
        "recommended_ability_order": [
          "citadel_ability_fissure_wall",
          "citadel_ability_mobile_resupply",
          "citadel_ability_shieldedsentry",
          "citadel_ability_rocket_barrage",
          "citadel_ability_fissure_wall",
          "citadel_ability_shieldedsentry",
          "citadel_ability_shieldedsentry",
          "citadel_ability_mobile_resupply",
          "citadel_ability_shieldedsentry",
          "citadel_ability_mobile_resupply",
          "citadel_ability_mobile_resupply",
          "citadel_ability_fissure_wall",
          "citadel_ability_fissure_wall",
          "citadel_ability_rocket_barrage",
          "citadel_ability_rocket_barrage",
          "citadel_ability_rocket_barrage"
        ],
        "player_selectable": true,
        "disabled": false,
        "in_development": false,
        "needs_testing": false,
        "assigned_players_only": false,
        "limited_testing": false,
        "complexity": 1,
        "skin": 0,
        "images": {
          "icon_hero_card": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/engineer_card.png",
          "icon_hero_card_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/engineer_card.webp",
          "icon_image_small": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/engineer_sm.png",
          "icon_image_small_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/engineer_sm.webp",
          "minimap_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/engineer_mm.png",
          "minimap_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/engineer_mm.webp",
          "selection_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/engineer.png",
          "selection_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/engineer.webp",
          "top_bar_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/engineer_hud.png",
          "top_bar_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/engineer_hud.webp"
        },
        "items": {
          "ability_climb_rope": "citadel_ability_climb_rope",
          "ability_innate1": "citadel_ability_dash",
          "ability_innate2": "citadel_ability_sprint",
          "ability_innate3": "citadel_ability_melee_parry",
          "ability_jump": "citadel_ability_jump",
          "ability_mantle": "citadel_ability_mantle",
          "ability_slide": "citadel_ability_slide",
          "ability_zip_line": "citadel_ability_zip_line",
          "ability_zip_line_boost": "citadel_ability_zipline_boost",
          "signature1": "citadel_ability_shieldedsentry",
          "signature2": "citadel_ability_mobile_resupply",
          "signature3": "citadel_ability_fissure_wall",
          "signature4": "citadel_ability_rocket_barrage",
          "weapon_melee": "citadel_ability_melee_engineer",
          "weapon_primary": "citadel_weapon_engineer_set"
        },
        "starting_stats": {
          "max_move_speed": {
            "value": 6.8,
            "display_stat_name": "EMaxMoveSpeed"
          },
          "sprint_speed": {
            "value": 2.0,
            "display_stat_name": "ESprintSpeed"
          },
          "crouch_speed": {
            "value": 4.75,
            "display_stat_name": "ECrouchSpeed"
          },
          "move_acceleration": {
            "value": 4.0,
            "display_stat_name": "EMoveAcceleration"
          },
          "light_melee_damage": {
            "value": 63,
            "display_stat_name": "ELightMeleeDamage"
          },
          "heavy_melee_damage": {
            "value": 116,
            "display_stat_name": "EHeavyMeleeDamage"
          },
          "max_health": {
            "value": 700,
            "display_stat_name": "EMaxHealth"
          },
          "weapon_power": {
            "value": 0,
            "display_stat_name": "EWeaponPower"
          },
          "reload_speed": {
            "value": 1,
            "display_stat_name": "EReloadSpeed"
          },
          "weapon_power_scale": {
            "value": 1,
            "display_stat_name": "EWeaponPowerScale"
          },
          "proc_build_up_rate_scale": {
            "value": 1,
            "display_stat_name": "EProcBuildUpRateScale"
          },
          "stamina": {
            "value": 2,
            "display_stat_name": "EStamina"
          },
          "base_health_regen": {
            "value": 2.0,
            "display_stat_name": "EBaseHealthRegen"
          },
          "stamina_regen_per_second": {
            "value": 0.2,
            "display_stat_name": "EStaminaRegenPerSecond"
          },
          "ability_resource_max": {
            "value": 0,
            "display_stat_name": "EAbilityResourceMax"
          },
          "ability_resource_regen_per_second": {
            "value": 0,
            "display_stat_name": "EAbilityResourceRegenPerSecond"
          },
          "crit_damage_received_scale": {
            "value": 1.0,
            "display_stat_name": "ECritDamageReceivedScale"
          },
          "tech_duration": {
            "value": 1,
            "display_stat_name": "ETechDuration"
          },
          "tech_range": {
            "value": 1,
            "display_stat_name": "ETechRange"
          }
        },
        "item_slot_info": {
          "spirit": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "vitality": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "weapon": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          }
        },
        "physics": {
          "collision_height": 80.0,
          "collision_radius": 20.0,
          "stealth_speed_meters_per_second": 4.0,
          "step_height": 32.0
        },
        "colors": {
          "glow_enemy": [
            255,
            0,
            0
          ],
          "glow_friendly": [
            255,
            239,
            215
          ],
          "glow_team1": [
            231,
            182,
            89
          ],
          "glow_team2": [
            91,
            121,
            230
          ],
          "ui": [
            70,
            104,
            155
          ]
        },
        "shop_stat_display": {
          "spirit_stats_display": {
            "display_stats": [
              "ETechCooldown",
              "ETechDuration",
              "ETechRange",
              "ETechLifesteal",
              "EMaxChargesIncrease",
              "ETechCooldownBetweenChargeUses"
            ]
          },
          "vitality_stats_display": {
            "display_stats": [
              "EMaxHealth",
              "EBaseHealthRegen",
              "EHealingOutput",
              "EOOCHealthRegen",
              "EBulletArmorDamageReduction",
              "ETechArmorDamageReduction",
              "EMeleeResist",
              "EDebuffResist",
              "ECritDamageReceivedScale"
            ],
            "other_display_stats": [
              "EMaxMoveSpeed",
              "ESprintSpeed",
              "EStaminaCooldown",
              "EStaminaRegenIncrease",
              "EStamina"
            ]
          },
          "weapon_stats_display": {
            "display_stats": [
              "EBulletDamage",
              "EBaseWeaponDamageIncrease",
              "ERoundsPerSecond",
              "EFireRate",
              "EClipSize",
              "EClipSizeIncrease",
              "EReloadTime",
              "EReloadSpeed",
              "EBulletSpeed",
              "EBulletSpeedIncrease",
              "EBulletLifesteal",
              "ECritDamageBonusScale"
            ],
            "other_display_stats": [
              "ELightMeleeDamage",
              "EHeavyMeleeDamage"
            ],
            "weapon_attributes": [
              "EWeaponAttribute_RapidFire",
              "EWeaponAttribute_MediumRange"
            ],
            "weapon_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/engineer_gun.png",
            "weapon_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/engineer_gun.webp"
          }
        },
        "cost_bonuses": {
          "spirit": [
            {
              "gold_threshold": 800,
              "bonus": 6.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 12.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 15.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 20.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 25.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 35.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 45.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 55.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 65.0,
              "percent_on_graph": 12.0
            }
          ],
          "vitality": [
            {
              "gold_threshold": 800,
              "bonus": 8.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 10.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 17.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 22.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 27.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 32.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 36.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 40.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 44.0,
              "percent_on_graph": 12.0
            }
          ],
          "weapon": [
            {
              "gold_threshold": 800,
              "bonus": 7.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 20.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 29.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 40.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 58.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 72.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 83.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 93.0,
              "percent_on_graph": 12.0
            }
          ]
        },
        "stats_display": {
          "health_header_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "health_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "magic_header_stats": [
            "ETechPower"
          ],
          "magic_stats": [
            "ETechCooldown",
            "ETechRange",
            "ETechDuration"
          ],
          "weapon_header_stats": [
            "EWeaponDPS",
            "EBulletDamage"
          ],
          "weapon_stats": [
            "ELightMeleeDamage",
            "EHeavyMeleeDamage",
            "EFireRate",
            "EClipSize"
          ]
        },
        "hero_stats_ui": {
          "weapon_stat_display": "EMeleeDamage_DEPRECATED",
          "display_stats": [
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxHealth"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBaseHealthRegen"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBulletArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ETechArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Spirit",
              "stat_type": "ETechPower"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EWeaponDPS"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EBulletDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EClipSize"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ERoundsPerSecond"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ELightMeleeDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EHeavyMeleeDamage"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxMoveSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ESprintSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EStamina"
            }
          ]
        },
        "level_info": {
          "1": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 0
          },
          "10": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 5200
          },
          "11": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6000
          },
          "12": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6800
          },
          "13": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 7600
          },
          "14": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 8400
          },
          "15": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 9200
          },
          "16": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 10000
          },
          "17": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 11000
          },
          "18": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 13000
          },
          "19": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 15000
          },
          "2": {
            "bonus_currencies": [
              "EAbilityPoints",
              "EAbilityUnlocks"
            ],
            "required_gold": 400
          },
          "20": {
            "use_standard_upgrade": true,
            "required_gold": 17000
          },
          "21": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 19000
          },
          "22": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 21000
          },
          "23": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 23000
          },
          "24": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 25000
          },
          "25": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 27000
          },
          "26": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 29000
          },
          "27": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 31000
          },
          "28": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 33000
          },
          "29": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 35000
          },
          "3": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 800
          },
          "30": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 37000
          },
          "31": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 39000
          },
          "32": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 41000
          },
          "33": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 43000
          },
          "34": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 44000
          },
          "35": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 45000
          },
          "36": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 46000
          },
          "37": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 47000
          },
          "4": {
            "use_standard_upgrade": true,
            "required_gold": 1200
          },
          "5": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 1500
          },
          "6": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 2200
          },
          "7": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 3000
          },
          "8": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 3500
          },
          "9": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 4500
          }
        },
        "scaling_stats": {},
        "purchase_bonuses": {
          "spirit": [
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 2,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 3,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 4,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 5,
              "value": "16"
            }
          ],
          "vitality": [
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 1,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 3,
              "value": "9"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 4,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 5,
              "value": "11"
            }
          ],
          "weapon": [
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 3,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 4,
              "value": "18"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 5,
              "value": "23"
            }
          ]
        },
        "standard_level_up_upgrades": {
          "MODIFIER_VALUE_BASE_BULLET_DAMAGE_FROM_LEVEL": 0.29,
          "MODIFIER_VALUE_BASE_HEALTH_FROM_LEVEL": 84.0,
          "MODIFIER_VALUE_BASE_MELEE_DAMAGE_FROM_LEVEL": 2.53,
          "MODIFIER_VALUE_BOON_COUNT": 1.0,
          "MODIFIER_VALUE_BULLET_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_ARMOR_DAMAGE_RESIST": 1.0,
          "MODIFIER_VALUE_TECH_POWER": 2.0
        }
      },
      {
        "id": 10,
        "class_name": "hero_chrono",
        "name": "Paradox",
        "description": {
          "lore": "Paradox.  An artifact of time, and the name of a notorious thieves' guild... one that prides themselves on constructing elaborate heists that target the most untouchable of individuals and institutions.  What does Paradox do with the countless artifacts, state secrets, and celebrity paternity tests that they have stolen?  Put it on display at pop-up museums, so that they can show the world that no one is out of Paradox\u2019s reach.\n\nShrouded in mystery, each member of Paradox dons a mask and takes on the organization's name.  They are everywhere.  They are nowhere.  And if they want something, they are inevitable.",
          "role": "Manipulates Space and Time",
          "playstyle": "Manipulating time lets Paradox outpace an enemy in one on one combat. She thrives by subjecting her enemies to timely swaps into a waiting pulse grenade, her wall, or into the middle of her teammates."
        },
        "recommended_upgrades": [
          "upgrade_medic_bullets",
          "upgrade_high_velocity_mag",
          "upgrade_health",
          "upgrade_guardian_ward",
          "upgrade_crackshot",
          "upgrade_containment",
          "upgrade_pristine_emblem",
          "upgrade_improved_stamina",
          "upgrade_long_range",
          "upgrade_express_shot",
          "upgrade_chonky",
          "upgrade_magic_tempo",
          "upgrade_healbane",
          "upgrade_hollow_point_rounds",
          "upgrade_sharpshooter",
          "upgrade_cooldown_reduction",
          "upgrade_superior_stamina",
          "upgrade_focus_lens",
          "upgrade_divine_barrier",
          "upgrade_banshee_slugs"
        ],
        "recommended_ability_order": [
          "citadel_ability_chrono_pulse_grenade",
          "citadel_ability_chrono_kinetic_carbine",
          "citadel_ability_chrono_kinetic_carbine",
          "citadel_ability_chrono_time_wall",
          "citadel_ability_chrono_time_wall",
          "citadel_ability_chrono_swap",
          "citadel_ability_chrono_kinetic_carbine",
          "citadel_ability_chrono_time_wall",
          "citadel_ability_chrono_swap",
          "citadel_ability_chrono_kinetic_carbine",
          "citadel_ability_chrono_time_wall",
          "citadel_ability_chrono_pulse_grenade",
          "citadel_ability_chrono_pulse_grenade",
          "citadel_ability_chrono_swap",
          "citadel_ability_chrono_swap",
          "citadel_ability_chrono_pulse_grenade"
        ],
        "player_selectable": true,
        "disabled": false,
        "in_development": false,
        "needs_testing": false,
        "assigned_players_only": false,
        "limited_testing": false,
        "complexity": 3,
        "skin": 0,
        "images": {
          "icon_hero_card": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/chrono_card.png",
          "icon_hero_card_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/chrono_card.webp",
          "icon_image_small": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/chrono_sm.png",
          "icon_image_small_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/chrono_sm.webp",
          "minimap_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/chrono_mm.png",
          "minimap_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/chrono_mm.webp",
          "selection_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/chrono.png",
          "selection_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/chrono.webp",
          "top_bar_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/chrono_hud.png",
          "top_bar_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/chrono_hud.webp"
        },
        "items": {
          "ability_climb_rope": "citadel_ability_climb_rope",
          "ability_innate1": "citadel_ability_dash",
          "ability_innate2": "citadel_ability_sprint",
          "ability_innate3": "citadel_ability_melee_parry",
          "ability_jump": "citadel_ability_jump",
          "ability_mantle": "citadel_ability_mantle",
          "ability_slide": "citadel_ability_slide",
          "ability_zip_line": "citadel_ability_zip_line",
          "ability_zip_line_boost": "citadel_ability_zipline_boost",
          "signature1": "citadel_ability_chrono_pulse_grenade",
          "signature2": "citadel_ability_chrono_time_wall",
          "signature3": "citadel_ability_chrono_kinetic_carbine",
          "signature4": "citadel_ability_chrono_swap",
          "weapon_melee": "citadel_ability_melee_chrono",
          "weapon_primary": "citadel_weapon_chrono_set"
        },
        "starting_stats": {
          "max_move_speed": {
            "value": 6.8,
            "display_stat_name": "EMaxMoveSpeed"
          },
          "sprint_speed": {
            "value": 2.0,
            "display_stat_name": "ESprintSpeed"
          },
          "crouch_speed": {
            "value": 4.75,
            "display_stat_name": "ECrouchSpeed"
          },
          "move_acceleration": {
            "value": 4.0,
            "display_stat_name": "EMoveAcceleration"
          },
          "light_melee_damage": {
            "value": 63,
            "display_stat_name": "ELightMeleeDamage"
          },
          "heavy_melee_damage": {
            "value": 116,
            "display_stat_name": "EHeavyMeleeDamage"
          },
          "max_health": {
            "value": 700,
            "display_stat_name": "EMaxHealth"
          },
          "weapon_power": {
            "value": 0,
            "display_stat_name": "EWeaponPower"
          },
          "reload_speed": {
            "value": 1,
            "display_stat_name": "EReloadSpeed"
          },
          "weapon_power_scale": {
            "value": 1,
            "display_stat_name": "EWeaponPowerScale"
          },
          "proc_build_up_rate_scale": {
            "value": 1,
            "display_stat_name": "EProcBuildUpRateScale"
          },
          "stamina": {
            "value": 3,
            "display_stat_name": "EStamina"
          },
          "base_health_regen": {
            "value": 2.0,
            "display_stat_name": "EBaseHealthRegen"
          },
          "stamina_regen_per_second": {
            "value": 0.2,
            "display_stat_name": "EStaminaRegenPerSecond"
          },
          "ability_resource_max": {
            "value": 0,
            "display_stat_name": "EAbilityResourceMax"
          },
          "ability_resource_regen_per_second": {
            "value": 0,
            "display_stat_name": "EAbilityResourceRegenPerSecond"
          },
          "crit_damage_received_scale": {
            "value": 1.0,
            "display_stat_name": "ECritDamageReceivedScale"
          },
          "tech_duration": {
            "value": 1,
            "display_stat_name": "ETechDuration"
          },
          "tech_range": {
            "value": 1,
            "display_stat_name": "ETechRange"
          }
        },
        "item_slot_info": {
          "spirit": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "vitality": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "weapon": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          }
        },
        "physics": {
          "collision_height": 80.0,
          "collision_radius": 20.0,
          "stealth_speed_meters_per_second": 4.0,
          "step_height": 32.0
        },
        "colors": {
          "glow_enemy": [
            255,
            0,
            0
          ],
          "glow_friendly": [
            255,
            239,
            215
          ],
          "glow_team1": [
            231,
            182,
            89
          ],
          "glow_team2": [
            91,
            121,
            230
          ],
          "ui": [
            152,
            57,
            82
          ]
        },
        "shop_stat_display": {
          "spirit_stats_display": {
            "display_stats": [
              "ETechCooldown",
              "ETechDuration",
              "ETechRange",
              "ETechLifesteal",
              "EMaxChargesIncrease",
              "ETechCooldownBetweenChargeUses"
            ]
          },
          "vitality_stats_display": {
            "display_stats": [
              "EMaxHealth",
              "EBaseHealthRegen",
              "EHealingOutput",
              "EOOCHealthRegen",
              "EBulletArmorDamageReduction",
              "ETechArmorDamageReduction",
              "EMeleeResist",
              "EDebuffResist",
              "ECritDamageReceivedScale"
            ],
            "other_display_stats": [
              "EMaxMoveSpeed",
              "ESprintSpeed",
              "EStaminaCooldown",
              "EStaminaRegenIncrease",
              "EStamina"
            ]
          },
          "weapon_stats_display": {
            "display_stats": [
              "EBulletDamage",
              "EBaseWeaponDamageIncrease",
              "ERoundsPerSecond",
              "EFireRate",
              "EClipSize",
              "EClipSizeIncrease",
              "EReloadTime",
              "EReloadSpeed",
              "EBulletSpeed",
              "EBulletSpeedIncrease",
              "EBulletLifesteal",
              "ECritDamageBonusScale"
            ],
            "other_display_stats": [
              "ELightMeleeDamage",
              "EHeavyMeleeDamage"
            ],
            "weapon_attributes": [
              "EWeaponAttribute_BurstFire",
              "EWeaponAttribute_MediumRange"
            ],
            "weapon_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/chrono_gun.png",
            "weapon_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/chrono_gun.webp"
          }
        },
        "cost_bonuses": {
          "spirit": [
            {
              "gold_threshold": 800,
              "bonus": 6.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 12.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 15.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 20.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 25.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 35.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 45.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 55.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 65.0,
              "percent_on_graph": 12.0
            }
          ],
          "vitality": [
            {
              "gold_threshold": 800,
              "bonus": 8.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 10.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 17.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 22.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 27.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 32.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 36.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 40.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 44.0,
              "percent_on_graph": 12.0
            }
          ],
          "weapon": [
            {
              "gold_threshold": 800,
              "bonus": 7.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 20.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 29.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 40.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 58.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 72.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 83.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 93.0,
              "percent_on_graph": 12.0
            }
          ]
        },
        "stats_display": {
          "health_header_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "health_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "magic_header_stats": [
            "ETechPower"
          ],
          "magic_stats": [
            "ETechCooldown",
            "ETechRange",
            "ETechDuration"
          ],
          "weapon_header_stats": [
            "EWeaponDPS",
            "EBulletDamage"
          ],
          "weapon_stats": [
            "ELightMeleeDamage",
            "EHeavyMeleeDamage",
            "EFireRate",
            "EClipSize"
          ]
        },
        "hero_stats_ui": {
          "weapon_stat_display": "EMeleeDamage_DEPRECATED",
          "display_stats": [
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxHealth"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBaseHealthRegen"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBulletArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ETechArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Spirit",
              "stat_type": "ETechPower"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EWeaponDPS"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EBulletDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EClipSize"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ERoundsPerSecond"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ELightMeleeDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EHeavyMeleeDamage"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxMoveSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ESprintSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EStamina"
            }
          ]
        },
        "level_info": {
          "1": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 0
          },
          "10": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 5200
          },
          "11": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6000
          },
          "12": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6800
          },
          "13": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 7600
          },
          "14": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 8400
          },
          "15": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 9200
          },
          "16": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 10000
          },
          "17": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 11000
          },
          "18": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 13000
          },
          "19": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 15000
          },
          "2": {
            "bonus_currencies": [
              "EAbilityPoints",
              "EAbilityUnlocks"
            ],
            "required_gold": 400
          },
          "20": {
            "use_standard_upgrade": true,
            "required_gold": 17000
          },
          "21": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 19000
          },
          "22": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 21000
          },
          "23": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 23000
          },
          "24": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 25000
          },
          "25": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 27000
          },
          "26": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 29000
          },
          "27": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 31000
          },
          "28": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 33000
          },
          "29": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 35000
          },
          "3": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 800
          },
          "30": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 37000
          },
          "31": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 39000
          },
          "32": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 41000
          },
          "33": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 43000
          },
          "34": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 44000
          },
          "35": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 45000
          },
          "36": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 46000
          },
          "37": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 47000
          },
          "4": {
            "use_standard_upgrade": true,
            "required_gold": 1200
          },
          "5": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 1500
          },
          "6": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 2200
          },
          "7": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 3000
          },
          "8": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 3500
          },
          "9": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 4500
          }
        },
        "scaling_stats": {},
        "purchase_bonuses": {
          "spirit": [
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 2,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 3,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 4,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 5,
              "value": "16"
            }
          ],
          "vitality": [
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 1,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 3,
              "value": "9"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 4,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 5,
              "value": "11"
            }
          ],
          "weapon": [
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 3,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 4,
              "value": "18"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 5,
              "value": "23"
            }
          ]
        },
        "standard_level_up_upgrades": {
          "MODIFIER_VALUE_BASE_BULLET_DAMAGE_FROM_LEVEL": 0.405,
          "MODIFIER_VALUE_BASE_HEALTH_FROM_LEVEL": 75.0,
          "MODIFIER_VALUE_BASE_MELEE_DAMAGE_FROM_LEVEL": 2.53,
          "MODIFIER_VALUE_BOON_COUNT": 1.0,
          "MODIFIER_VALUE_BULLET_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_POWER": 2.0
        }
      },
      {
        "id": 11,
        "class_name": "hero_dynamo",
        "name": "Dynamo",
        "description": {
          "lore": "As a Scientist, Professor Dynamo always had an inquisitive mind.  So when a rift in space and time opened up in central park he was first on the scene to investigate \u2013 and while he expected such a majestic sight to be life changing, he was thinking more in a metaphorical way as opposed to having his body atomized and reduced to a tiny dying star.\n\nBut while his body is gone, his spirit and lust for knowledge lives on.  A tenured professor at Columbia College, Dynamo looks to learn more about his condition while maintaining his class load, after all: he has future minds to inspire.",
          "role": "Locks down the enemy team",
          "playstyle": "Dynamo keeps himself and his allies healthy while waiting for his moment. Few things can warp a team fight more than a well-coordinated use of Singularity."
        },
        "recommended_upgrades": [
          "upgrade_non_player_bonus",
          "upgrade_extra_charge",
          "upgrade_magic_burst",
          "upgrade_magic_reach",
          "upgrade_non_player_bonus_sacrifice",
          "upgrade_magic_tempo",
          "upgrade_arcane_extension",
          "upgrade_cooldown_reduction",
          "upgrade_healing_booster",
          "upgrade_rapid_recharge",
          "upgrade_rocket_booster",
          "upgrade_tech_range",
          "upgrade_arcane_surge",
          "upgrade_ability_refresher",
          "upgrade_healbuff",
          "upgrade_boundless_spirit",
          "upgrade_diviners_kevlar",
          "upgrade_cheat_death"
        ],
        "recommended_ability_order": [
          "citadel_ability_nikuman",
          "citadel_ability_void_sphere",
          "citadel_ability_stomp",
          "citadel_ability_self_vacuum",
          "citadel_ability_stomp",
          "citadel_ability_stomp",
          "citadel_ability_void_sphere",
          "citadel_ability_self_vacuum",
          "citadel_ability_self_vacuum",
          "citadel_ability_self_vacuum",
          "citadel_ability_nikuman",
          "citadel_ability_nikuman",
          "citadel_ability_nikuman",
          "citadel_ability_stomp",
          "citadel_ability_void_sphere",
          "citadel_ability_void_sphere"
        ],
        "player_selectable": true,
        "disabled": false,
        "in_development": false,
        "needs_testing": false,
        "assigned_players_only": false,
        "limited_testing": false,
        "complexity": 2,
        "skin": 0,
        "images": {
          "icon_hero_card": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/sumo_card.png",
          "icon_hero_card_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/sumo_card.webp",
          "icon_image_small": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/sumo_sm.png",
          "icon_image_small_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/sumo_sm.webp",
          "minimap_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/sumo_mm.png",
          "minimap_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/sumo_mm.webp",
          "selection_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/sumo.png",
          "selection_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/sumo.webp",
          "top_bar_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/sumo_hud.png",
          "top_bar_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/sumo_hud.webp"
        },
        "items": {
          "ability_climb_rope": "citadel_ability_climb_rope",
          "ability_innate1": "citadel_ability_dash",
          "ability_innate2": "citadel_ability_sprint",
          "ability_innate3": "citadel_ability_melee_parry",
          "ability_jump": "citadel_ability_jump",
          "ability_mantle": "citadel_ability_mantle",
          "ability_slide": "citadel_ability_slide",
          "ability_zip_line": "citadel_ability_zip_line",
          "ability_zip_line_boost": "citadel_ability_zipline_boost",
          "signature1": "citadel_ability_stomp",
          "signature2": "citadel_ability_void_sphere",
          "signature3": "citadel_ability_nikuman",
          "signature4": "citadel_ability_self_vacuum",
          "weapon_melee": "citadel_ability_melee_sumo",
          "weapon_primary": "citadel_weapon_sumo_set"
        },
        "starting_stats": {
          "max_move_speed": {
            "value": 6.8,
            "display_stat_name": "EMaxMoveSpeed"
          },
          "sprint_speed": {
            "value": 2.0,
            "display_stat_name": "ESprintSpeed"
          },
          "crouch_speed": {
            "value": 4.75,
            "display_stat_name": "ECrouchSpeed"
          },
          "move_acceleration": {
            "value": 4.0,
            "display_stat_name": "EMoveAcceleration"
          },
          "light_melee_damage": {
            "value": 63,
            "display_stat_name": "ELightMeleeDamage"
          },
          "heavy_melee_damage": {
            "value": 116,
            "display_stat_name": "EHeavyMeleeDamage"
          },
          "max_health": {
            "value": 800,
            "display_stat_name": "EMaxHealth"
          },
          "weapon_power": {
            "value": 0,
            "display_stat_name": "EWeaponPower"
          },
          "reload_speed": {
            "value": 1,
            "display_stat_name": "EReloadSpeed"
          },
          "weapon_power_scale": {
            "value": 1,
            "display_stat_name": "EWeaponPowerScale"
          },
          "proc_build_up_rate_scale": {
            "value": 1,
            "display_stat_name": "EProcBuildUpRateScale"
          },
          "stamina": {
            "value": 3,
            "display_stat_name": "EStamina"
          },
          "base_health_regen": {
            "value": 2.0,
            "display_stat_name": "EBaseHealthRegen"
          },
          "stamina_regen_per_second": {
            "value": 0.2,
            "display_stat_name": "EStaminaRegenPerSecond"
          },
          "ability_resource_max": {
            "value": 0,
            "display_stat_name": "EAbilityResourceMax"
          },
          "ability_resource_regen_per_second": {
            "value": 0,
            "display_stat_name": "EAbilityResourceRegenPerSecond"
          },
          "crit_damage_received_scale": {
            "value": 1.0,
            "display_stat_name": "ECritDamageReceivedScale"
          },
          "tech_duration": {
            "value": 1,
            "display_stat_name": "ETechDuration"
          },
          "tech_range": {
            "value": 1,
            "display_stat_name": "ETechRange"
          }
        },
        "item_slot_info": {
          "spirit": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "vitality": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "weapon": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          }
        },
        "physics": {
          "collision_height": 80.0,
          "collision_radius": 20.0,
          "stealth_speed_meters_per_second": 4.0,
          "step_height": 32.0
        },
        "colors": {
          "glow_enemy": [
            255,
            0,
            0
          ],
          "glow_friendly": [
            255,
            239,
            215
          ],
          "glow_team1": [
            231,
            182,
            89
          ],
          "glow_team2": [
            91,
            121,
            230
          ],
          "ui": [
            207,
            185,
            69
          ]
        },
        "shop_stat_display": {
          "spirit_stats_display": {
            "display_stats": [
              "ETechCooldown",
              "ETechDuration",
              "ETechRange",
              "ETechLifesteal",
              "EMaxChargesIncrease",
              "ETechCooldownBetweenChargeUses"
            ]
          },
          "vitality_stats_display": {
            "display_stats": [
              "EMaxHealth",
              "EBaseHealthRegen",
              "EHealingOutput",
              "EOOCHealthRegen",
              "EBulletArmorDamageReduction",
              "ETechArmorDamageReduction",
              "EMeleeResist",
              "EDebuffResist",
              "ECritDamageReceivedScale"
            ],
            "other_display_stats": [
              "EMaxMoveSpeed",
              "ESprintSpeed",
              "EStaminaCooldown",
              "EStaminaRegenIncrease",
              "EStamina"
            ]
          },
          "weapon_stats_display": {
            "display_stats": [
              "EBulletDamage",
              "EBaseWeaponDamageIncrease",
              "ERoundsPerSecond",
              "EFireRate",
              "EClipSize",
              "EClipSizeIncrease",
              "EReloadTime",
              "EReloadSpeed",
              "EBulletSpeed",
              "EBulletSpeedIncrease",
              "EBulletLifesteal",
              "ECritDamageBonusScale"
            ],
            "other_display_stats": [
              "ELightMeleeDamage",
              "EHeavyMeleeDamage"
            ],
            "weapon_attributes": [
              "EWeaponAttribute_MediumRange",
              "EWeaponAttribute_HeavyHitter",
              "EWeaponAttribute_Projectile"
            ],
            "weapon_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/dynamo_gun.png",
            "weapon_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/dynamo_gun.webp"
          }
        },
        "cost_bonuses": {
          "spirit": [
            {
              "gold_threshold": 800,
              "bonus": 6.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 12.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 15.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 20.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 25.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 35.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 45.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 55.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 65.0,
              "percent_on_graph": 12.0
            }
          ],
          "vitality": [
            {
              "gold_threshold": 800,
              "bonus": 8.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 10.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 17.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 22.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 27.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 32.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 36.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 40.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 44.0,
              "percent_on_graph": 12.0
            }
          ],
          "weapon": [
            {
              "gold_threshold": 800,
              "bonus": 7.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 20.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 29.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 40.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 58.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 72.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 83.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 93.0,
              "percent_on_graph": 12.0
            }
          ]
        },
        "stats_display": {
          "health_header_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "health_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "magic_header_stats": [
            "ETechPower"
          ],
          "magic_stats": [
            "ETechCooldown",
            "ETechRange",
            "ETechDuration"
          ],
          "weapon_header_stats": [
            "EWeaponDPS",
            "EBulletDamage"
          ],
          "weapon_stats": [
            "ELightMeleeDamage",
            "EHeavyMeleeDamage",
            "EFireRate",
            "EClipSize"
          ]
        },
        "hero_stats_ui": {
          "weapon_stat_display": "EMeleeDamage_DEPRECATED",
          "display_stats": [
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxHealth"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBaseHealthRegen"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBulletArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ETechArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Spirit",
              "stat_type": "ETechPower"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EWeaponDPS"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EBulletDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EClipSize"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ERoundsPerSecond"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ELightMeleeDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EHeavyMeleeDamage"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxMoveSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ESprintSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EStamina"
            }
          ]
        },
        "level_info": {
          "1": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 0
          },
          "10": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 5200
          },
          "11": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6000
          },
          "12": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6800
          },
          "13": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 7600
          },
          "14": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 8400
          },
          "15": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 9200
          },
          "16": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 10000
          },
          "17": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 11000
          },
          "18": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 13000
          },
          "19": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 15000
          },
          "2": {
            "bonus_currencies": [
              "EAbilityPoints",
              "EAbilityUnlocks"
            ],
            "required_gold": 400
          },
          "20": {
            "use_standard_upgrade": true,
            "required_gold": 17000
          },
          "21": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 19000
          },
          "22": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 21000
          },
          "23": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 23000
          },
          "24": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 25000
          },
          "25": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 27000
          },
          "26": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 29000
          },
          "27": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 31000
          },
          "28": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 33000
          },
          "29": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 35000
          },
          "3": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 800
          },
          "30": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 37000
          },
          "31": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 39000
          },
          "32": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 41000
          },
          "33": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 43000
          },
          "34": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 44000
          },
          "35": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 45000
          },
          "36": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 46000
          },
          "37": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 47000
          },
          "4": {
            "use_standard_upgrade": true,
            "required_gold": 1200
          },
          "5": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 1500
          },
          "6": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 2200
          },
          "7": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 3000
          },
          "8": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 3500
          },
          "9": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 4500
          }
        },
        "scaling_stats": {},
        "purchase_bonuses": {
          "spirit": [
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 2,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 3,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 4,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 5,
              "value": "16"
            }
          ],
          "vitality": [
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 1,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 3,
              "value": "9"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 4,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 5,
              "value": "11"
            }
          ],
          "weapon": [
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 3,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 4,
              "value": "18"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 5,
              "value": "23"
            }
          ]
        },
        "standard_level_up_upgrades": {
          "MODIFIER_VALUE_BASE_BULLET_DAMAGE_FROM_LEVEL": 0.636429,
          "MODIFIER_VALUE_BASE_HEALTH_FROM_LEVEL": 94.0,
          "MODIFIER_VALUE_BASE_MELEE_DAMAGE_FROM_LEVEL": 2.53,
          "MODIFIER_VALUE_BOON_COUNT": 1.0,
          "MODIFIER_VALUE_BULLET_ARMOR_DAMAGE_RESIST": 1.0,
          "MODIFIER_VALUE_TECH_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_POWER": 2.0
        }
      },
      {
        "id": 12,
        "class_name": "hero_kelvin",
        "name": "Kelvin",
        "description": {
          "lore": "A famed adventuring scientist, Kelvin made it his life's mission to explore and understand the unknowable.  So naturally when rumors surfaced regarding an 8th astral gate hidden in the arctic, Kelvin couldn't build an expedition team fast enough.  Assembling the brightest minds of his generation, Kelvin and his team set forth with much fanfare.\n\nThey never returned.\n\nA year and a half later the frozen body of Kelvin was found by a fishing trawler, his corpse clutching a rock etched with glowing runes.  The crew chipped away at the ice, looking to get a closer look at the body and were shocked when Kelvin opened his eyes.  They checked his vitals... there was no pulse.  They sought to bandage his open wounds... there was no blood.  And yet, impossibly, Kelvin was \"alive\".\n\nHaving no memory of what happened on the expedition, Kelvin is looking for answers.",
          "role": "Freezes enemies in their tracks",
          "playstyle": "Timely heals and splitting a teamfight properly is the difference between an easy victory or a ruinous defeat. Gliding around slowing enemies gives Kelvin's team the maneuvering advantage to make this happen."
        },
        "recommended_upgrades": [
          "upgrade_high_velocity_mag",
          "upgrade_endurance",
          "upgrade_magic_burst",
          "upgrade_close_range",
          "upgrade_extra_charge",
          "upgrade_improved_spirit",
          "upgrade_healing_booster",
          "upgrade_guardian_ward",
          "upgrade_magic_shield",
          "upgrade_sprint_booster",
          "upgrade_rapid_recharge",
          "upgrade_trophy_collector",
          "upgrade_hollow_point_rounds",
          "upgrade_soaring_spirit",
          "upgrade_arcane_extension",
          "upgrade_close_quarter_combat",
          "upgrade_magic_shock",
          "upgrade_imbued_duration_extender",
          "upgrade_healbuff",
          "upgrade_divine_barrier",
          "upgrade_critshot",
          "upgrade_boundless_spirit"
        ],
        "recommended_ability_order": [
          "ability_icebeam",
          "ability_ice_grenade",
          "ability_icepath",
          "ability_ice_dome",
          "ability_icebeam",
          "ability_ice_grenade",
          "ability_ice_grenade",
          "ability_icebeam",
          "ability_icebeam",
          "ability_ice_dome",
          "ability_ice_dome",
          "ability_icepath",
          "ability_ice_dome",
          "ability_icepath",
          "ability_ice_grenade",
          "ability_icepath"
        ],
        "player_selectable": true,
        "disabled": false,
        "in_development": false,
        "needs_testing": false,
        "assigned_players_only": false,
        "limited_testing": false,
        "complexity": 2,
        "skin": 0,
        "images": {
          "icon_hero_card": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/kelvin_card.png",
          "icon_hero_card_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/kelvin_card.webp",
          "icon_image_small": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/kelvin_sm.png",
          "icon_image_small_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/kelvin_sm.webp",
          "minimap_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/kelvin_mm.png",
          "minimap_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/kelvin_mm.webp",
          "selection_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/kelvin.png",
          "selection_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/kelvin.webp",
          "top_bar_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/kelvin_hud.png",
          "top_bar_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/kelvin_hud.webp"
        },
        "items": {
          "ability_climb_rope": "citadel_ability_climb_rope",
          "ability_innate1": "citadel_ability_dash",
          "ability_innate2": "citadel_ability_sprint",
          "ability_innate3": "citadel_ability_melee_parry",
          "ability_jump": "citadel_ability_jump",
          "ability_mantle": "citadel_ability_mantle",
          "ability_slide": "citadel_ability_slide",
          "ability_zip_line": "citadel_ability_zip_line",
          "ability_zip_line_boost": "citadel_ability_zipline_boost",
          "signature1": "ability_ice_grenade",
          "signature2": "ability_icepath",
          "signature3": "ability_icebeam",
          "signature4": "ability_ice_dome",
          "weapon_melee": "ability_melee_kelvin",
          "weapon_primary": "citadel_weapon_kelvin_set"
        },
        "starting_stats": {
          "max_move_speed": {
            "value": 6.8,
            "display_stat_name": "EMaxMoveSpeed"
          },
          "sprint_speed": {
            "value": 1.5,
            "display_stat_name": "ESprintSpeed"
          },
          "crouch_speed": {
            "value": 4.75,
            "display_stat_name": "ECrouchSpeed"
          },
          "move_acceleration": {
            "value": 4.0,
            "display_stat_name": "EMoveAcceleration"
          },
          "light_melee_damage": {
            "value": 63,
            "display_stat_name": "ELightMeleeDamage"
          },
          "heavy_melee_damage": {
            "value": 116,
            "display_stat_name": "EHeavyMeleeDamage"
          },
          "max_health": {
            "value": 800,
            "display_stat_name": "EMaxHealth"
          },
          "weapon_power": {
            "value": 0,
            "display_stat_name": "EWeaponPower"
          },
          "reload_speed": {
            "value": 1,
            "display_stat_name": "EReloadSpeed"
          },
          "weapon_power_scale": {
            "value": 1,
            "display_stat_name": "EWeaponPowerScale"
          },
          "proc_build_up_rate_scale": {
            "value": 1,
            "display_stat_name": "EProcBuildUpRateScale"
          },
          "stamina": {
            "value": 3,
            "display_stat_name": "EStamina"
          },
          "base_health_regen": {
            "value": 2.0,
            "display_stat_name": "EBaseHealthRegen"
          },
          "stamina_regen_per_second": {
            "value": 0.1666,
            "display_stat_name": "EStaminaRegenPerSecond"
          },
          "ability_resource_max": {
            "value": 0,
            "display_stat_name": "EAbilityResourceMax"
          },
          "ability_resource_regen_per_second": {
            "value": 0,
            "display_stat_name": "EAbilityResourceRegenPerSecond"
          },
          "crit_damage_received_scale": {
            "value": 1.0,
            "display_stat_name": "ECritDamageReceivedScale"
          },
          "tech_duration": {
            "value": 1,
            "display_stat_name": "ETechDuration"
          },
          "tech_range": {
            "value": 1,
            "display_stat_name": "ETechRange"
          }
        },
        "item_slot_info": {
          "spirit": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "vitality": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "weapon": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          }
        },
        "physics": {
          "collision_height": 80.0,
          "collision_radius": 20.0,
          "stealth_speed_meters_per_second": 4.0,
          "step_height": 32.0
        },
        "colors": {
          "glow_enemy": [
            255,
            0,
            0
          ],
          "glow_friendly": [
            255,
            239,
            215
          ],
          "glow_team1": [
            231,
            182,
            89
          ],
          "glow_team2": [
            91,
            121,
            230
          ],
          "ui": [
            116,
            171,
            188
          ]
        },
        "shop_stat_display": {
          "spirit_stats_display": {
            "display_stats": [
              "ETechCooldown",
              "ETechDuration",
              "ETechRange",
              "ETechLifesteal",
              "EMaxChargesIncrease",
              "ETechCooldownBetweenChargeUses"
            ]
          },
          "vitality_stats_display": {
            "display_stats": [
              "EMaxHealth",
              "EBaseHealthRegen",
              "EHealingOutput",
              "EOOCHealthRegen",
              "EBulletArmorDamageReduction",
              "ETechArmorDamageReduction",
              "EMeleeResist",
              "EDebuffResist",
              "ECritDamageReceivedScale"
            ],
            "other_display_stats": [
              "EMaxMoveSpeed",
              "ESprintSpeed",
              "EStaminaCooldown",
              "EStaminaRegenIncrease",
              "EStamina"
            ]
          },
          "weapon_stats_display": {
            "display_stats": [
              "EBulletDamage",
              "EBaseWeaponDamageIncrease",
              "ERoundsPerSecond",
              "EFireRate",
              "EClipSize",
              "EClipSizeIncrease",
              "EReloadTime",
              "EReloadSpeed",
              "EBulletSpeed",
              "EBulletSpeedIncrease",
              "EBulletLifesteal",
              "ECritDamageBonusScale"
            ],
            "other_display_stats": [
              "ELightMeleeDamage",
              "EHeavyMeleeDamage"
            ],
            "weapon_attributes": [
              "EWeaponAttribute_MediumRange",
              "EWeaponAttribute_HeavyHitter",
              "EWeaponAttribute_Projectile"
            ],
            "weapon_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/kelvin_gun.png",
            "weapon_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/kelvin_gun.webp"
          }
        },
        "cost_bonuses": {
          "spirit": [
            {
              "gold_threshold": 800,
              "bonus": 6.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 12.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 15.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 20.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 25.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 35.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 45.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 55.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 65.0,
              "percent_on_graph": 12.0
            }
          ],
          "vitality": [
            {
              "gold_threshold": 800,
              "bonus": 8.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 10.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 17.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 22.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 27.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 32.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 36.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 40.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 44.0,
              "percent_on_graph": 12.0
            }
          ],
          "weapon": [
            {
              "gold_threshold": 800,
              "bonus": 7.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 20.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 29.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 40.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 58.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 72.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 83.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 93.0,
              "percent_on_graph": 12.0
            }
          ]
        },
        "stats_display": {
          "health_header_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "health_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "magic_header_stats": [
            "ETechPower"
          ],
          "magic_stats": [
            "ETechCooldown",
            "ETechRange",
            "ETechDuration"
          ],
          "weapon_header_stats": [
            "EWeaponDPS",
            "EBulletDamage"
          ],
          "weapon_stats": [
            "ELightMeleeDamage",
            "EHeavyMeleeDamage",
            "EFireRate",
            "EClipSize"
          ]
        },
        "hero_stats_ui": {
          "weapon_stat_display": "EMeleeDamage_DEPRECATED",
          "display_stats": [
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxHealth"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBaseHealthRegen"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBulletArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ETechArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Spirit",
              "stat_type": "ETechPower"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EWeaponDPS"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EBulletDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EClipSize"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ERoundsPerSecond"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ELightMeleeDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EHeavyMeleeDamage"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxMoveSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ESprintSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EStamina"
            }
          ]
        },
        "level_info": {
          "1": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 0
          },
          "10": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 5200
          },
          "11": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6000
          },
          "12": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6800
          },
          "13": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 7600
          },
          "14": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 8400
          },
          "15": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 9200
          },
          "16": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 10000
          },
          "17": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 11000
          },
          "18": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 13000
          },
          "19": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 15000
          },
          "2": {
            "bonus_currencies": [
              "EAbilityPoints",
              "EAbilityUnlocks"
            ],
            "required_gold": 400
          },
          "20": {
            "use_standard_upgrade": true,
            "required_gold": 17000
          },
          "21": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 19000
          },
          "22": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 21000
          },
          "23": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 23000
          },
          "24": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 25000
          },
          "25": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 27000
          },
          "26": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 29000
          },
          "27": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 31000
          },
          "28": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 33000
          },
          "29": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 35000
          },
          "3": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 800
          },
          "30": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 37000
          },
          "31": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 39000
          },
          "32": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 41000
          },
          "33": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 43000
          },
          "34": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 44000
          },
          "35": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 45000
          },
          "36": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 46000
          },
          "37": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 47000
          },
          "4": {
            "use_standard_upgrade": true,
            "required_gold": 1200
          },
          "5": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 1500
          },
          "6": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 2200
          },
          "7": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 3000
          },
          "8": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 3500
          },
          "9": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 4500
          }
        },
        "scaling_stats": {},
        "purchase_bonuses": {
          "spirit": [
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 2,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 3,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 4,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 5,
              "value": "16"
            }
          ],
          "vitality": [
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 1,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 3,
              "value": "9"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 4,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 5,
              "value": "11"
            }
          ],
          "weapon": [
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 3,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 4,
              "value": "18"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 5,
              "value": "23"
            }
          ]
        },
        "standard_level_up_upgrades": {
          "MODIFIER_VALUE_BASE_BULLET_DAMAGE_FROM_LEVEL": 0.6,
          "MODIFIER_VALUE_BASE_HEALTH_FROM_LEVEL": 92.0,
          "MODIFIER_VALUE_BASE_MELEE_DAMAGE_FROM_LEVEL": 2.53,
          "MODIFIER_VALUE_BOON_COUNT": 1.0,
          "MODIFIER_VALUE_BULLET_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_ARMOR_DAMAGE_RESIST": 1.0,
          "MODIFIER_VALUE_TECH_POWER": 2.0
        }
      },
      {
        "id": 13,
        "class_name": "hero_haze",
        "name": "Haze",
        "description": {
          "lore": "The Occult Security and Investigation Commission is a black box government organization that makes the CIA look transparent.  It falls on the men, women, and entities of the OSIC to keep the country safe from sinister forces that are beyond the capabilities of local law enforcement.\n\nAs a member of the notorious Sandman Division, Haze is routinely tasked with infiltrating the dreams of persons of interest, to assess their threat level, and if needed... to put them to sleep.",
          "role": "Sneaks in and sprays bullets",
          "playstyle": "When Haze fixates on a target she can hold her own in a firefight. She prefers to create one sided exchanges, avoiding damage then picking off unsuspecting targets up close."
        },
        "recommended_upgrades": [
          "upgrade_endurance",
          "upgrade_clip_size",
          "upgrade_rapid_rounds",
          "upgrade_improved_spirit",
          "upgrade_vampire",
          "upgrade_slowing_bullets",
          "upgrade_blitz_bullets",
          "upgrade_quick_silver",
          "upgrade_regenerating_bullet_shield",
          "upgrade_bullet_resist_shredder",
          "upgrade_burst_fire",
          "upgrade_chonky",
          "upgrade_critshot",
          "upgrade_focus_lens",
          "upgrade_aprounds",
          "upgrade_ricochet",
          "upgrade_siphon_bullets"
        ],
        "recommended_ability_order": [
          "ability_stacking_damage",
          "ability_sleep_dagger",
          "ability_stacking_damage",
          "ability_smoke_bomb",
          "ability_stacking_damage",
          "ability_bullet_flurry",
          "ability_bullet_flurry",
          "ability_stacking_damage",
          "ability_smoke_bomb",
          "ability_smoke_bomb",
          "ability_sleep_dagger",
          "ability_sleep_dagger",
          "ability_bullet_flurry",
          "ability_bullet_flurry",
          "ability_sleep_dagger",
          "ability_smoke_bomb"
        ],
        "player_selectable": true,
        "disabled": false,
        "in_development": false,
        "needs_testing": false,
        "assigned_players_only": false,
        "limited_testing": false,
        "complexity": 1,
        "skin": 0,
        "images": {
          "icon_hero_card": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/haze_card.png",
          "icon_hero_card_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/haze_card.webp",
          "icon_image_small": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/haze_sm.png",
          "icon_image_small_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/haze_sm.webp",
          "minimap_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/haze_mm.png",
          "minimap_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/haze_mm.webp",
          "selection_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/haze.png",
          "selection_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/haze.webp",
          "top_bar_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/haze_hud.png",
          "top_bar_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/haze_hud.webp"
        },
        "items": {
          "ability_climb_rope": "citadel_ability_climb_rope",
          "ability_innate1": "citadel_ability_dash",
          "ability_innate2": "citadel_ability_sprint",
          "ability_innate3": "citadel_ability_melee_parry",
          "ability_jump": "citadel_ability_jump",
          "ability_mantle": "citadel_ability_mantle",
          "ability_slide": "citadel_ability_slide",
          "ability_zip_line": "citadel_ability_zip_line",
          "ability_zip_line_boost": "citadel_ability_zipline_boost",
          "signature1": "ability_sleep_dagger",
          "signature2": "ability_smoke_bomb",
          "signature3": "ability_stacking_damage",
          "signature4": "ability_bullet_flurry",
          "weapon_melee": "ability_melee_haze",
          "weapon_primary": "citadel_weapon_haze_set"
        },
        "starting_stats": {
          "max_move_speed": {
            "value": 8.3,
            "display_stat_name": "EMaxMoveSpeed"
          },
          "sprint_speed": {
            "value": 2.0,
            "display_stat_name": "ESprintSpeed"
          },
          "crouch_speed": {
            "value": 4.75,
            "display_stat_name": "ECrouchSpeed"
          },
          "move_acceleration": {
            "value": 4.0,
            "display_stat_name": "EMoveAcceleration"
          },
          "light_melee_damage": {
            "value": 63,
            "display_stat_name": "ELightMeleeDamage"
          },
          "heavy_melee_damage": {
            "value": 116,
            "display_stat_name": "EHeavyMeleeDamage"
          },
          "max_health": {
            "value": 650,
            "display_stat_name": "EMaxHealth"
          },
          "weapon_power": {
            "value": 0,
            "display_stat_name": "EWeaponPower"
          },
          "reload_speed": {
            "value": 1,
            "display_stat_name": "EReloadSpeed"
          },
          "weapon_power_scale": {
            "value": 1,
            "display_stat_name": "EWeaponPowerScale"
          },
          "proc_build_up_rate_scale": {
            "value": 1,
            "display_stat_name": "EProcBuildUpRateScale"
          },
          "stamina": {
            "value": 3,
            "display_stat_name": "EStamina"
          },
          "base_health_regen": {
            "value": 2.0,
            "display_stat_name": "EBaseHealthRegen"
          },
          "stamina_regen_per_second": {
            "value": 0.2,
            "display_stat_name": "EStaminaRegenPerSecond"
          },
          "ability_resource_max": {
            "value": 0,
            "display_stat_name": "EAbilityResourceMax"
          },
          "ability_resource_regen_per_second": {
            "value": 0,
            "display_stat_name": "EAbilityResourceRegenPerSecond"
          },
          "crit_damage_received_scale": {
            "value": 1.0,
            "display_stat_name": "ECritDamageReceivedScale"
          },
          "tech_duration": {
            "value": 1,
            "display_stat_name": "ETechDuration"
          },
          "tech_range": {
            "value": 1,
            "display_stat_name": "ETechRange"
          }
        },
        "item_slot_info": {
          "spirit": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "vitality": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "weapon": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          }
        },
        "physics": {
          "collision_height": 80.0,
          "collision_radius": 20.0,
          "stealth_speed_meters_per_second": 4.0,
          "step_height": 32.0
        },
        "colors": {
          "glow_enemy": [
            255,
            0,
            0
          ],
          "glow_friendly": [
            255,
            239,
            215
          ],
          "glow_team1": [
            231,
            182,
            89
          ],
          "glow_team2": [
            91,
            121,
            230
          ],
          "ui": [
            172,
            97,
            51
          ]
        },
        "shop_stat_display": {
          "spirit_stats_display": {
            "display_stats": [
              "ETechCooldown",
              "ETechDuration",
              "ETechRange",
              "ETechLifesteal",
              "EMaxChargesIncrease",
              "ETechCooldownBetweenChargeUses"
            ]
          },
          "vitality_stats_display": {
            "display_stats": [
              "EMaxHealth",
              "EBaseHealthRegen",
              "EHealingOutput",
              "EOOCHealthRegen",
              "EBulletArmorDamageReduction",
              "ETechArmorDamageReduction",
              "EMeleeResist",
              "EDebuffResist",
              "ECritDamageReceivedScale"
            ],
            "other_display_stats": [
              "EMaxMoveSpeed",
              "ESprintSpeed",
              "EStaminaCooldown",
              "EStaminaRegenIncrease",
              "EStamina"
            ]
          },
          "weapon_stats_display": {
            "display_stats": [
              "EBulletDamage",
              "EBaseWeaponDamageIncrease",
              "ERoundsPerSecond",
              "EFireRate",
              "EClipSize",
              "EClipSizeIncrease",
              "EReloadTime",
              "EReloadSpeed",
              "EBulletSpeed",
              "EBulletSpeedIncrease",
              "EBulletLifesteal",
              "ECritDamageBonusScale"
            ],
            "other_display_stats": [
              "ELightMeleeDamage",
              "EHeavyMeleeDamage"
            ],
            "weapon_attributes": [
              "EWeaponAttribute_RapidFire",
              "EWeaponAttribute_CloseRange"
            ],
            "weapon_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/haze_gun.png",
            "weapon_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/haze_gun.webp"
          }
        },
        "cost_bonuses": {
          "spirit": [
            {
              "gold_threshold": 800,
              "bonus": 6.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 12.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 15.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 20.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 25.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 35.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 45.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 55.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 65.0,
              "percent_on_graph": 12.0
            }
          ],
          "vitality": [
            {
              "gold_threshold": 800,
              "bonus": 8.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 10.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 17.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 22.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 27.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 32.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 36.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 40.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 44.0,
              "percent_on_graph": 12.0
            }
          ],
          "weapon": [
            {
              "gold_threshold": 800,
              "bonus": 7.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 20.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 29.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 40.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 58.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 72.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 83.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 93.0,
              "percent_on_graph": 12.0
            }
          ]
        },
        "stats_display": {
          "health_header_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "health_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "magic_header_stats": [
            "ETechPower"
          ],
          "magic_stats": [
            "ETechCooldown",
            "ETechRange",
            "ETechDuration"
          ],
          "weapon_header_stats": [
            "EWeaponDPS",
            "EBulletDamage"
          ],
          "weapon_stats": [
            "ELightMeleeDamage",
            "EHeavyMeleeDamage",
            "EFireRate",
            "EClipSize"
          ]
        },
        "hero_stats_ui": {
          "weapon_stat_display": "EMeleeDamage_DEPRECATED",
          "display_stats": [
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxHealth"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBaseHealthRegen"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBulletArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ETechArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Spirit",
              "stat_type": "ETechPower"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EWeaponDPS"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EBulletDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EClipSize"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ERoundsPerSecond"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ELightMeleeDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EHeavyMeleeDamage"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxMoveSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ESprintSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EStamina"
            }
          ]
        },
        "level_info": {
          "1": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 0
          },
          "10": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 5200
          },
          "11": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6000
          },
          "12": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6800
          },
          "13": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 7600
          },
          "14": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 8400
          },
          "15": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 9200
          },
          "16": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 10000
          },
          "17": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 11000
          },
          "18": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 13000
          },
          "19": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 15000
          },
          "2": {
            "bonus_currencies": [
              "EAbilityPoints",
              "EAbilityUnlocks"
            ],
            "required_gold": 400
          },
          "20": {
            "use_standard_upgrade": true,
            "required_gold": 17000
          },
          "21": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 19000
          },
          "22": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 21000
          },
          "23": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 23000
          },
          "24": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 25000
          },
          "25": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 27000
          },
          "26": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 29000
          },
          "27": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 31000
          },
          "28": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 33000
          },
          "29": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 35000
          },
          "3": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 800
          },
          "30": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 37000
          },
          "31": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 39000
          },
          "32": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 41000
          },
          "33": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 43000
          },
          "34": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 44000
          },
          "35": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 45000
          },
          "36": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 46000
          },
          "37": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 47000
          },
          "4": {
            "use_standard_upgrade": true,
            "required_gold": 1200
          },
          "5": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 1500
          },
          "6": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 2200
          },
          "7": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 3000
          },
          "8": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 3500
          },
          "9": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 4500
          }
        },
        "scaling_stats": {
          "EClipSize": {
            "scaling_stat": "ETechPower",
            "scale": 0.5
          }
        },
        "purchase_bonuses": {
          "spirit": [
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 2,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 3,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 4,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 5,
              "value": "16"
            }
          ],
          "vitality": [
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 1,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 3,
              "value": "9"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 4,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 5,
              "value": "11"
            }
          ],
          "weapon": [
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 3,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 4,
              "value": "18"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 5,
              "value": "23"
            }
          ]
        },
        "standard_level_up_upgrades": {
          "MODIFIER_VALUE_BASE_BULLET_DAMAGE_FROM_LEVEL": 0.201536,
          "MODIFIER_VALUE_BASE_HEALTH_FROM_LEVEL": 53.0,
          "MODIFIER_VALUE_BASE_MELEE_DAMAGE_FROM_LEVEL": 2.53,
          "MODIFIER_VALUE_BOON_COUNT": 1.0,
          "MODIFIER_VALUE_BULLET_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_POWER": 2.0
        }
      },
      {
        "id": 14,
        "class_name": "hero_astro",
        "name": "Holliday",
        "description": {
          "lore": "There are people who spent their whole lives dreaming about moving to New York.  Holliday isn't one of those people.  Content with being a Sheriff in a small town, Holliday enjoyed a career where the only time she had to use her gun was when trick shooting at the county fair...then the murders started.\n\nGrisly and inhumane; the bodies were found with their ribcages ripped open... their innards picked apart as if by birds.  Holliday tracked down the killer, a travelling folk musician that the media dubbed \"The Troubadour\", but when she confronted him he exploded into a murder of crows and flew away.\n\nThat was 6 months ago, and while the murders in central Illinois have stopped, Holliday's investigation has not.  She believes that The Troubadour is travelling to New York, and when she finds him she's going to kill that evil son of a bitch.",
          "role": "Bounces about dispensing trick shots",
          "playstyle": "Holliday depends on her skills as a crack shot, shooting things she's bounced into the air. With good aim she can lay out heavy damage. Her movement skills let her isolate her enemies or beat a hasty retreat."
        },
        "recommended_upgrades": [
          "upgrade_endurance",
          "upgrade_headshot_booster",
          "upgrade_improved_spirit",
          "upgrade_extra_charge",
          "upgrade_magic_burst",
          "upgrade_long_range",
          "upgrade_magic_shield",
          "upgrade_quick_silver",
          "upgrade_headhunter",
          "upgrade_rapid_recharge",
          "upgrade_hollow_point_rounds",
          "upgrade_magic_shock",
          "upgrade_chonky",
          "upgrade_critshot",
          "upgrade_tech_bleed",
          "upgrade_tech_overflow"
        ],
        "recommended_ability_order": [
          "ability_crackshot",
          "ability_explosive_barrel",
          "ability_bounce_pad",
          "ability_gravity_lasso",
          "ability_explosive_barrel",
          "ability_explosive_barrel",
          "ability_gravity_lasso",
          "ability_gravity_lasso",
          "ability_gravity_lasso",
          "ability_bounce_pad",
          "ability_bounce_pad",
          "ability_crackshot",
          "ability_crackshot",
          "ability_explosive_barrel",
          "ability_bounce_pad",
          "ability_crackshot"
        ],
        "player_selectable": true,
        "disabled": false,
        "in_development": false,
        "needs_testing": false,
        "assigned_players_only": false,
        "limited_testing": false,
        "complexity": 3,
        "skin": 0,
        "images": {
          "icon_hero_card": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/astro_card.png",
          "icon_hero_card_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/astro_card.webp",
          "icon_image_small": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/astro_sm.png",
          "icon_image_small_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/astro_sm.webp",
          "minimap_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/astro_mm.png",
          "minimap_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/astro_mm.webp",
          "selection_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/astro.png",
          "selection_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/astro.webp",
          "top_bar_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/astro_hud.png",
          "top_bar_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/hero_portraits/astro_hud.webp"
        },
        "items": {
          "ability_climb_rope": "citadel_ability_climb_rope",
          "ability_innate1": "citadel_ability_dash",
          "ability_innate2": "citadel_ability_sprint",
          "ability_innate3": "citadel_ability_melee_parry",
          "ability_jump": "citadel_ability_jump",
          "ability_mantle": "citadel_ability_mantle",
          "ability_slide": "citadel_ability_slide",
          "ability_zip_line": "citadel_ability_zip_line",
          "ability_zip_line_boost": "citadel_ability_zipline_boost",
          "signature1": "ability_explosive_barrel",
          "signature2": "ability_bounce_pad",
          "signature3": "ability_crackshot",
          "signature4": "ability_gravity_lasso",
          "weapon_melee": "ability_melee_astro",
          "weapon_primary": "citadel_weapon_astro_set"
        },
        "starting_stats": {
          "max_move_speed": {
            "value": 8.3,
            "display_stat_name": "EMaxMoveSpeed"
          },
          "sprint_speed": {
            "value": 2.0,
            "display_stat_name": "ESprintSpeed"
          },
          "crouch_speed": {
            "value": 4.75,
            "display_stat_name": "ECrouchSpeed"
          },
          "move_acceleration": {
            "value": 4.0,
            "display_stat_name": "EMoveAcceleration"
          },
          "light_melee_damage": {
            "value": 63,
            "display_stat_name": "ELightMeleeDamage"
          },
          "heavy_melee_damage": {
            "value": 116,
            "display_stat_name": "EHeavyMeleeDamage"
          },
          "max_health": {
            "value": 700,
            "display_stat_name": "EMaxHealth"
          },
          "weapon_power": {
            "value": 0,
            "display_stat_name": "EWeaponPower"
          },
          "reload_speed": {
            "value": 1,
            "display_stat_name": "EReloadSpeed"
          },
          "weapon_power_scale": {
            "value": 1,
            "display_stat_name": "EWeaponPowerScale"
          },
          "proc_build_up_rate_scale": {
            "value": 1,
            "display_stat_name": "EProcBuildUpRateScale"
          },
          "stamina": {
            "value": 2,
            "display_stat_name": "EStamina"
          },
          "base_health_regen": {
            "value": 2.0,
            "display_stat_name": "EBaseHealthRegen"
          },
          "stamina_regen_per_second": {
            "value": 0.2,
            "display_stat_name": "EStaminaRegenPerSecond"
          },
          "ability_resource_max": {
            "value": 0,
            "display_stat_name": "EAbilityResourceMax"
          },
          "ability_resource_regen_per_second": {
            "value": 0,
            "display_stat_name": "EAbilityResourceRegenPerSecond"
          },
          "crit_damage_received_scale": {
            "value": 1.0,
            "display_stat_name": "ECritDamageReceivedScale"
          },
          "tech_duration": {
            "value": 1,
            "display_stat_name": "ETechDuration"
          },
          "tech_range": {
            "value": 1,
            "display_stat_name": "ETechRange"
          }
        },
        "item_slot_info": {
          "spirit": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "vitality": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          },
          "weapon": {
            "max_purchases_for_tier": [
              6,
              6,
              6
            ]
          }
        },
        "physics": {
          "collision_height": 80.0,
          "collision_radius": 20.0,
          "stealth_speed_meters_per_second": 4.0,
          "step_height": 32.0
        },
        "colors": {
          "glow_enemy": [
            255,
            0,
            0
          ],
          "glow_friendly": [
            255,
            239,
            215
          ],
          "glow_team1": [
            231,
            182,
            89
          ],
          "glow_team2": [
            91,
            121,
            230
          ],
          "ui": [
            142,
            76,
            49
          ]
        },
        "shop_stat_display": {
          "spirit_stats_display": {
            "display_stats": [
              "ETechCooldown",
              "ETechDuration",
              "ETechRange",
              "ETechLifesteal",
              "EMaxChargesIncrease",
              "ETechCooldownBetweenChargeUses"
            ]
          },
          "vitality_stats_display": {
            "display_stats": [
              "EMaxHealth",
              "EBaseHealthRegen",
              "EHealingOutput",
              "EOOCHealthRegen",
              "EBulletArmorDamageReduction",
              "ETechArmorDamageReduction",
              "EMeleeResist",
              "EDebuffResist",
              "ECritDamageReceivedScale"
            ],
            "other_display_stats": [
              "EMaxMoveSpeed",
              "ESprintSpeed",
              "EStaminaCooldown",
              "EStaminaRegenIncrease",
              "EStamina"
            ]
          },
          "weapon_stats_display": {
            "display_stats": [
              "EBulletDamage",
              "EBaseWeaponDamageIncrease",
              "ERoundsPerSecond",
              "EFireRate",
              "EClipSize",
              "EClipSizeIncrease",
              "EReloadTime",
              "EReloadSpeed",
              "EBulletSpeed",
              "EBulletSpeedIncrease",
              "EBulletLifesteal",
              "ECritDamageBonusScale"
            ],
            "other_display_stats": [
              "ELightMeleeDamage",
              "EHeavyMeleeDamage"
            ],
            "weapon_attributes": [
              "EWeaponAttribute_MediumRange",
              "EWeaponAttribute_HeavyHitter"
            ],
            "weapon_image": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/astro_gun.png",
            "weapon_image_webp": "https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/guns/astro_gun.webp"
          }
        },
        "cost_bonuses": {
          "spirit": [
            {
              "gold_threshold": 800,
              "bonus": 6.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 12.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 15.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 20.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 25.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 35.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 45.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 55.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 65.0,
              "percent_on_graph": 12.0
            }
          ],
          "vitality": [
            {
              "gold_threshold": 800,
              "bonus": 8.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 10.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 17.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 22.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 27.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 32.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 36.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 40.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 44.0,
              "percent_on_graph": 12.0
            }
          ],
          "weapon": [
            {
              "gold_threshold": 800,
              "bonus": 7.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 1600,
              "bonus": 9.0,
              "percent_on_graph": 8.0
            },
            {
              "gold_threshold": 2400,
              "bonus": 13.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 3200,
              "bonus": 20.0,
              "percent_on_graph": 9.0
            },
            {
              "gold_threshold": 4800,
              "bonus": 29.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 7200,
              "bonus": 40.0,
              "percent_on_graph": 10.0
            },
            {
              "gold_threshold": 9600,
              "bonus": 58.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 16000,
              "bonus": 72.0,
              "percent_on_graph": 11.0
            },
            {
              "gold_threshold": 22400,
              "bonus": 83.0,
              "percent_on_graph": 12.0
            },
            {
              "gold_threshold": 28800,
              "bonus": 93.0,
              "percent_on_graph": 12.0
            }
          ]
        },
        "stats_display": {
          "health_header_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "health_stats": [
            "EMaxHealth",
            "EBaseHealthRegen"
          ],
          "magic_header_stats": [
            "ETechPower"
          ],
          "magic_stats": [
            "ETechCooldown",
            "ETechRange",
            "ETechDuration"
          ],
          "weapon_header_stats": [
            "EWeaponDPS",
            "EBulletDamage"
          ],
          "weapon_stats": [
            "ELightMeleeDamage",
            "EHeavyMeleeDamage",
            "EFireRate",
            "EClipSize"
          ]
        },
        "hero_stats_ui": {
          "weapon_stat_display": "EMeleeDamage_DEPRECATED",
          "display_stats": [
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxHealth"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBaseHealthRegen"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EBulletArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ETechArmorDamageReduction"
            },
            {
              "category": "ECitadelStat_Spirit",
              "stat_type": "ETechPower"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EWeaponDPS"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EBulletDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EClipSize"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ERoundsPerSecond"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "ELightMeleeDamage"
            },
            {
              "category": "ECitadelStat_Weapon",
              "stat_type": "EHeavyMeleeDamage"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EMaxMoveSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "ESprintSpeed"
            },
            {
              "category": "ECitadelStat_Vitality",
              "stat_type": "EStamina"
            }
          ]
        },
        "level_info": {
          "1": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 0
          },
          "10": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 5200
          },
          "11": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6000
          },
          "12": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 6800
          },
          "13": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 7600
          },
          "14": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 8400
          },
          "15": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 9200
          },
          "16": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 10000
          },
          "17": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 11000
          },
          "18": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 13000
          },
          "19": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 15000
          },
          "2": {
            "bonus_currencies": [
              "EAbilityPoints",
              "EAbilityUnlocks"
            ],
            "required_gold": 400
          },
          "20": {
            "use_standard_upgrade": true,
            "required_gold": 17000
          },
          "21": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 19000
          },
          "22": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 21000
          },
          "23": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 23000
          },
          "24": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 25000
          },
          "25": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 27000
          },
          "26": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 29000
          },
          "27": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 31000
          },
          "28": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 33000
          },
          "29": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 35000
          },
          "3": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 800
          },
          "30": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 37000
          },
          "31": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 39000
          },
          "32": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 41000
          },
          "33": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 43000
          },
          "34": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 44000
          },
          "35": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 45000
          },
          "36": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 46000
          },
          "37": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 47000
          },
          "4": {
            "use_standard_upgrade": true,
            "required_gold": 1200
          },
          "5": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 1500
          },
          "6": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 2200
          },
          "7": {
            "bonus_currencies": [
              "EAbilityUnlocks"
            ],
            "required_gold": 3000
          },
          "8": {
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 3500
          },
          "9": {
            "use_standard_upgrade": true,
            "bonus_currencies": [
              "EAbilityPoints"
            ],
            "required_gold": 4500
          }
        },
        "scaling_stats": {},
        "purchase_bonuses": {
          "spirit": [
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 2,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 3,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 4,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_TECH_POWER",
              "tier": 5,
              "value": "16"
            }
          ],
          "vitality": [
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 1,
              "value": "7"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 3,
              "value": "9"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 4,
              "value": "10"
            },
            {
              "value_type": "MODIFIER_VALUE_BASE_HEALTH_PERCENT",
              "tier": 5,
              "value": "11"
            }
          ],
          "weapon": [
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 1,
              "value": "4"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 2,
              "value": "8"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 3,
              "value": "13"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 4,
              "value": "18"
            },
            {
              "value_type": "MODIFIER_VALUE_BASEATTACK_DAMAGE_PERCENT",
              "tier": 5,
              "value": "23"
            }
          ]
        },
        "standard_level_up_upgrades": {
          "MODIFIER_VALUE_BASE_BULLET_DAMAGE_FROM_LEVEL": 1.72,
          "MODIFIER_VALUE_BASE_HEALTH_FROM_LEVEL": 65.0,
          "MODIFIER_VALUE_BASE_MELEE_DAMAGE_FROM_LEVEL": 2.53,
          "MODIFIER_VALUE_BOON_COUNT": 1.0,
          "MODIFIER_VALUE_BULLET_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_ARMOR_DAMAGE_RESIST": 0.0,
          "MODIFIER_VALUE_TECH_POWER": 2.0
        }
      }
]